import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Securely destroys the multi-tenant session context by purging 
 * the HTTP-Only access token from the client's storage.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Explicitly check if the token exists before destruction logging
    const hasToken = cookieStore.has("sacco_access_token");

    if (hasToken) {
      cookieStore.delete("sacco_access_token");
    //   console.log("Session destroyed cleanly. Operator logged out.");
    }

    return NextResponse.json(
      { success: true, message: "Session terminated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Critical Auth Logout Exception:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while processing the logout handshake." },
      { status: 500 }
    );
  }
}