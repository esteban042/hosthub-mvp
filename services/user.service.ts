import bcrypt from 'bcryptjs';
import { query } from '../dputils.js';
import { User } from '../types.js';

/**
 * Creates a new user in the database.
 * @param email The user's email.
 * @param password The user's plain text password.
 * @returns The newly created user object.
 */
export async function createUser(email: string, password: string): Promise<User> {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const result = await query<User>(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role',
    [email, passwordHash]
  );

  if (result.length === 0) {
    throw new Error('User creation failed unexpectedly.');
  }

  return result[0];
}
