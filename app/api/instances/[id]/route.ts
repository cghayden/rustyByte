// app/api/instances/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { dockerService } from '../../../../lib/docker';
import { verifyApiAuth } from '../../../../lib/auth';

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export async function GET(
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
      include: {
        challenge: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      );
    }

    // Check actual container status
    const containerStatus = await dockerService.getInstanceStatus(
      instance.containerName
    );

    // Update database if status has changed
    if (containerStatus) {
      if (containerStatus.status !== instance.status) {
        await prisma.instance.update({
          where: { id: instanceId },
          data: { status: containerStatus.status },
        });
        instance.status = containerStatus.status;
      }
    } else {
      // Container not found, mark as stopped
      await prisma.instance.update({
        where: { id: instanceId },
        data: { status: 'stopped' },
      });
      instance.status = 'stopped';
    }

    return NextResponse.json({
      success: true,
      instance,
      terminalUrl: instance.hostPort
        ? `http://localhost:${instance.hostPort}`
        : null,
    });
  } catch (error) {
    console.error('Error fetching instance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instance' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
        { error: 'Forbidden - Cannot delete other users\' instances' },
        { status: 403 }
      );
    }

    // Stop and remove container
    const stopped = await dockerService.stopInstance(instance.containerName);

    if (stopped) {
      // Update database
      await prisma.instance.update({
        where: { id: instanceId },
        data: {
          status: 'stopped',
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Instance stopped successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to stop container' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error stopping instance:', error);
    return NextResponse.json(
      { error: 'Failed to stop instance' },
      { status: 500 }
    );
  }
}
