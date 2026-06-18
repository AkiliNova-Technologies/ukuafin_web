import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { OrganizationUserRole, PlatformRole } from "@prisma/client";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-use-env-in-prod");

export interface SaccoJWTPayload extends JWTPayload {
  userId: string;
  name: string;
  email: string;
  platformRole: PlatformRole | null;
  saccoRole: OrganizationUserRole | null;
  organizationId: string | null;
  branchId: string | null;
}

/**
 * Encrypts user tenant context data records into a secure JWT access token string.
 */
export async function createToken(payload: SaccoJWTPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/**
 * Validates cryptographic signature authenticity and returns the cast structural tenant payload context.
 */
export async function verifyToken(token: string): Promise<SaccoJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    return payload as SaccoJWTPayload;
  } catch {
    return null;
  }
}