import { db } from "../db";
import { users } from "../db/schema";

/**
 * Registers a new user in the database.
 * Hashes the password using Bun's native bcrypt hashing.
 * 
 * @param name User's name
 * @param email User's email (must be unique)
 * @param password Plain text password to be hashed
 * @returns boolean true if registration succeeded, false if failed (e.g. email duplication)
 */
export async function registerUser(name: string, email: string, password: string): Promise<boolean> {
  try {
    // Hash password using Bun's native bcrypt support
    const hashedPassword = await Bun.password.hash(password, "bcrypt");

    // Insert user into database
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    return true;
  } catch (error) {
    console.error("Failed to register user:", error);
    return false;
  }
}
