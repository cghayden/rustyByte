// app/api/instances/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { dockerService } from '../../../lib/docker';

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId } = await request.json();

    if (!userId || !challengeId) {
      return NextResponse.json(
        { error: 'userId and challengeId are required' },
        { status: 400 }
      );
    }

    // Get challenge details
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    if (!challenge.dockerImage) {
      return NextResponse.json(
        { error: 'Challenge does not support terminal access' },
        { status: 400 }
      );
    }

    // Check if user already has an instance for this challenge
    const existingInstance = await prisma.instance.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
    });

    if (existingInstance) {
      // Verify the container actually exists in Docker
      const containerStatus = await dockerService.getInstanceStatus(existingInstance.containerName);
      
      if (containerStatus && (containerStatus.status === 'running' || containerStatus.status === 'paused')) {
        // Container exists and is active
        return NextResponse.json({
          success: true,
          instance: existingInstance,
          message: 'Instance already exists',
        });
      } else {
        // Container doesn't exist or is stopped - clean up database record
        await prisma.instance.delete({
          where: { id: existingInstance.id },
        });
      }
    }

    // Create new container instance
    const containerInstance = await dockerService.createInstance(
      userId,
      challenge.slug,
      challenge.dockerImage
    );

    /**
     * SECURITY: Store authentication token in database
     * 
     * The authToken (format: "ctf:TOKEN") is stored so that:
     * 1. Frontend can retrieve it to authenticate iframe connections
     * 2. Only the user who owns this instance can access their credentials
     * 3. Token persists across page reloads and browser sessions
     * 4. Each userId+challengeId combination has unique credentials
     * 
     * This prevents users from accessing each other's terminals even if
     * they discover the port numbers, since they won't have the token.
     */
    const instance = await prisma.instance.upsert({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
      update: {
        containerName: containerInstance.name,
        hostPort: containerInstance.port,
        authToken: containerInstance.authToken, // SECURITY: Store credentials
        status: 'running',
        updatedAt: new Date(),
      },
      create: {
        userId,
        challengeId,
        containerName: containerInstance.name,
        hostPort: containerInstance.port,
        authToken: containerInstance.authToken, // SECURITY: Store credentials
        status: 'running',
      },
    });

    return NextResponse.json({
      success: true,
      instance,
      terminalUrl: `http://localhost:${containerInstance.port}`,
      message: 'Container instance created successfully',
    });
  } catch (error) {
    console.error('Error creating instance:', error);
    return NextResponse.json(
      { error: 'Failed to create instance' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user's instances
    const instances = await prisma.instance.findMany({
      where: { userId },
      include: {
        challenge: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      instances,
    });
  } catch (error) {
    console.error('Error fetching instances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instances' },
      { status: 500 }
    );
  }
}
