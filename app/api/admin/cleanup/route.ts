import { NextRequest, NextResponse } from 'next/server';
import { dockerService } from '../../../../lib/docker';
import { getCurrentUser } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Allow admin secret header or authenticated admin user
    const adminSecret = process.env.ADMIN_SECRET || 'change-me';
    const headerSecret = request.headers.get('x-admin-secret');

    let allowed = false;

    if (headerSecret && headerSecret === adminSecret) {
      allowed = true;
    } else {
      const user = await getCurrentUser();
      if (user && 'role' in user && (user.role === 'ADMIN')) {
        allowed = true;
      }
    }

    if (!allowed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dockerService.cleanupExpired();

    return NextResponse.json({ success: true, message: 'Cleanup triggered' });
  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
