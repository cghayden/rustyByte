import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}
const SALT_ROUNDS = 12;

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Set authentication cookie
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Get authentication cookie
 */
export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth-token');
  return authCookie?.value || null;
}

/**
 * Remove authentication cookie
 */
export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

/**
 * Get current user from JWT token in cookie
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthCookie();
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Get current user with full data from database (including role)
 */
export async function getCurrentUserWithRole(): Promise<{ userId: string; email: string; username: string; role: string } | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  // Import db instance
  const db = (await import('./db')).default;

  const dbUser = await db.user.findUnique({
    where: { id: user.userId },
    select: { id: true, email: true, username: true, role: true },
  });

  if (!dbUser) {
    return null;
  }

  return {
    userId: dbUser.id,
    email: dbUser.email,
    username: dbUser.username,
    role: dbUser.role,
  };
}

/**
 * Check if current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUserWithRole();
  return user?.role === 'ADMIN';
}

/**
 * Check if current user can create/edit challenges (ADMIN or AUTHOR)
 */
export async function canCreateChallenges(): Promise<boolean> {
  const user = await getCurrentUserWithRole();
  return user?.role === 'ADMIN' || user?.role === 'AUTHOR';
}

/**
 * Validate password strength (relaxed for testing)
 */
export function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 1) {
    errors.push('Password is required');
  }

  return errors;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
