// app/api/instances/[id]/unpause/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { dockerService } from '../../../../../lib/docker';

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Unpause container
    const unpaused = await dockerService.unpauseInstance(instance.containerName);

    if (unpaused) {
      // Update database status
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
    } else {
      return NextResponse.json(
        { error: 'Failed to unpause container' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error unpausing instance:', error);
    return NextResponse.json(
      { error: 'Failed to unpause instance' },
      { status: 500 }
    );
  }
}
