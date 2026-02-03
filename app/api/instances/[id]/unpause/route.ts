// app/api/instances/[id]/unpause/route.ts
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
        { error: 'Forbidden - Cannot unpause other users\' instances' },
        { status: 403 }
      );
    }

    // Check actual container status first
    const containerStatus = await dockerService.getInstanceStatus(instance.containerName);
    
    if (!containerStatus) {
      return NextResponse.json(
        { error: 'Container not found' },
        { status: 404 }
      );
    }

    // Only unpause if actually paused
    if (containerStatus.status === 'paused') {
      try {
        await dockerService.unpauseInstance(instance.containerName);
      } catch (unpauseError: any) {
        console.error('Error unpausing container:', unpauseError);
        return NextResponse.json(
          { error: 'Failed to unpause container' },
          { status: 500 }
        );
      }
    }

    // Update database status to running
    await prisma.instance.update({
      where: { id: instanceId },
      data: {
        status: 'running',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Instance resumed successfully',
    });
  } catch (error) {
    console.error('Error unpausing instance:', error);
    return NextResponse.json(
      { error: 'Failed to unpause instance' },
      { status: 500 }
    );
  }
}
