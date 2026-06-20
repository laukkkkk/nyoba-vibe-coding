import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq, and } from "drizzle-orm";

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

/**
 * Logins a user by verifying name and email, then creates a new session.
 * 
 * @param name User's name
 * @param email User's email
 * @returns string | null session token if successful, null if failed
 */
export async function loginUser(name: string, email: string): Promise<string | null> {
  try {
    // Find matching user
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.name, name), eq(users.email, email)))
      .limit(1);

    if (!user) {
      return null;
    }

    // Generate session token (UUID)
    const token = crypto.randomUUID();

    // Insert session into database
    await db.insert(sessions).values({
      token,
      userId: user.id,
    });

    return token;
  } catch (error) {
    console.error("Failed to login user:", error);
    return null;
  }
}

