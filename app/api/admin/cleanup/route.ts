import { NextRequest, NextResponse } from 'next/server';
import { dockerService } from '../../../../lib/docker';
import { verifyApiAdmin } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify admin authentication
    const isAdmin = await verifyApiAdmin(request);
    
    // Also allow admin secret header for cron jobs
    const adminSecret = process.env.ADMIN_SECRET;
    const headerSecret = request.headers.get('x-admin-secret');
    const hasValidSecret = adminSecret && headerSecret === adminSecret;

    if (!isAdmin && !hasValidSecret) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    await dockerService.cleanupExpired();

    return NextResponse.json({ success: true, message: 'Cleanup triggered' });
  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
