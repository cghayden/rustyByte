import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, validatePassword, generateToken, setAuthCookie } from '@/lib/auth';
import { Role } from '../../../../generated/prisma/enums';

const CLUB_INVITE_CODE = process.env.CLUB_INVITE_CODE;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, inviteCode } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { error: 'Password validation failed', details: passwordErrors },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await db.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    // Determine role based on invite code
    const role =
      inviteCode && CLUB_INVITE_CODE && inviteCode === CLUB_INVITE_CODE
        ? Role.BCC_CTFCLUB
        : Role.USER;

    // Create user
    const user = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Set auth cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
