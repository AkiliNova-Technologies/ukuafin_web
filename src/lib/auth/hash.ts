import bcrypt from "bcryptjs";

const WORK_FACTOR_SALT_ROUNDS = 12;
const MAX_PASSWORD_BYTE_LIMIT = 72;

/**
 * Transforms a plaintext string credentials entry into an isolated, secure cryptographic hash.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.trim() === "") {
    throw new Error("Validation Failure: Secure password entry cannot be initialized empty.");
  }

  // Prevent Bcrypt DOS attack compute hanging on oversized inputs
  if (password.length > MAX_PASSWORD_BYTE_LIMIT) {
    throw new Error(`Validation Failure: Password string length exceeds maximum security limit of ${MAX_PASSWORD_BYTE_LIMIT} characters.`);
  }

  try {
    return await bcrypt.hash(password, WORK_FACTOR_SALT_ROUNDS);
  } catch (error) {
    console.error("CRITICAL SECURITY EXCEPTION: Password encryption process failure:", error);
    throw new Error("Internal security hashing engine encountered an operation failure.");
  }
}

/**
 * Compares an incoming text credential against a known database storage string hash safely.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash || password.trim() === "" || hash.trim() === "") {
    return false;
  }

  if (password.length > MAX_PASSWORD_BYTE_LIMIT) {
    return false;
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("SECURITY WARNING: Exception occurred during pass-verification compare sequences:", error);
    return false;
  }
}