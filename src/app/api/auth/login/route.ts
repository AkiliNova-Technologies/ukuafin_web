import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma/client"; 
import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
  saccoCode: z.string().toLowerCase().trim().optional().or(z.literal("")),
});

const DUMMY_HASH = "$2a$10$ExR9Mv2WzM86i7yKsh1S/.Wp9M17TiwGZ3EBlPkmH/i7fO06E7uGq";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid credentials or SACCO code format" },
        { status: 400 }
      );
    }

    const { email, password, saccoCode } = validation.data;

    // Fetch the user out of the database first
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
        branch: true,
      },
    });

    let tenantContextValid = true;

    if (user) {
      const isPlatformAdmin = user.platformRole === "PLATFORM_SUPER_ADMIN";

      if (!isPlatformAdmin) {
        // Enforce strict workspace matching only for regular Sacco staff/members
        if (!saccoCode) {
          tenantContextValid = false;
        } else {
          const matchesOrg = user.organization?.slug.toLowerCase() === saccoCode;
          const matchesBranch = user.branch?.code.toLowerCase() === saccoCode;

          if (!matchesOrg && !matchesBranch) {
            tenantContextValid = false;
          }
        }
      }
    }

    // Timing Attack Mitigation
    const passwordHashToCompare = user?.passwordHash ?? DUMMY_HASH;
    const isPasswordValid = await bcrypt.compare(password, passwordHashToCompare);

    // if (!user || !isPasswordValid || !tenantContextValid) {
    //   return NextResponse.json(
    //     { error: "Invalid email, password, or SACCO workspace code combination" },
    //     { status: 401 }
    //   );
    // }

    if (!user) {
      return NextResponse.json({ error: "DEBUG: User record not found for this email." }, { status: 401 });
    }
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: "DEBUG: Password verification failed (Hash mismatch)." }, { status: 401 });
    }
    
    if (!tenantContextValid) {
      return NextResponse.json({ 
        error: `DEBUG: Tenant context invalid. User platformRole in DB is "${user.platformRole || "null"}"` 
      }, { status: 401 });
    }

    // Account status checks
    if (user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Your user account has been deactivated." }, { status: 403 });
    }

    if (user.organizationId && user.organization?.status !== "ACTIVE") {
      return NextResponse.json({ error: "Institutional workspace is suspended." }, { status: 403 });
    }

    const saccoRole = user.memberId ? "MEMBER" : (user.organizationId ? "OWNER" : null);
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      branchId: user.branchId,
      saccoRole: saccoRole, 
      platformRole: user.platformRole,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("12h")
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set({
      name: "sacco_access_token",
      value: token,
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax", 
      path: "/",
      maxAge: 60 * 60 * 12, 
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        saccoRole: saccoRole,
        platformRole: user.platformRole,
      },
    });

  } catch (error) {
    console.error("🚨 Critical Auth Pipeline Exception:", error);
    return NextResponse.json(
      { error: "An internal security handshake failure occurred" },
      { status: 500 }
    );
  }
}