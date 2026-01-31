// app/api/instances/[id]/pause/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { dockerService } from '../../../../../lib/docker';
import { verifyApiAuth } from '../../../../../lib/auth';

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: Verify user is authenticated
    const authenticatedUser = await verifyApiAuth(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const { id: instanceId } = await params;

    // Get instance from database
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId },
    });

    if (!instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      );
    }

    // SECURITY: Verify user owns this instance
    if (instance.userId !== authenticatedUser.userId) {
      return NextResponse.json(
        { error: 'Forbidden - Cannot pause other users\' instances' },
        { status: 403 }
      );
    }

    // Pause container
    const paused = await dockerService.pauseInstance(instance.containerName);

    if (paused) {
      // Update database status
      await prisma.instance.update({
        where: { id: instanceId },
        data: {
          status: 'paused',
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Instance paused successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to pause container' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error pausing instance:', error);
    return NextResponse.json(
      { error: 'Failed to pause instance' },
      { status: 500 }
    );
  }
}
