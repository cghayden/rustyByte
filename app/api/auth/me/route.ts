import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    const tokenUser = await getCurrentUser();

    if (!tokenUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch fresh data from database (in case username was updated)
    const user = await db.user.findUnique({
      where: { id: tokenUser.userId },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
