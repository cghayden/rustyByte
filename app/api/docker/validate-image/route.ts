import { NextResponse } from 'next/server';
import { canCreateChallenges } from '@/lib/auth';
import { isValidDockerImage } from '@/lib/dockerImages';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

/**
 * POST /api/docker/validate-image
 * Validates that a Docker image exists on the server
 */
export async function POST(request: Request) {
  // Only AUTHORS and ADMINS can validate images (same as creating challenges)
  const hasPermission = await canCreateChallenges();
  if (!hasPermission) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { imageTag } = await request.json();

    if (!imageTag || typeof imageTag !== 'string') {
      return NextResponse.json({ error: 'Image tag is required' }, { status: 400 });
    }

    // First check if it's in our allowed list
    if (!isValidDockerImage(imageTag)) {
      return NextResponse.json(
        { exists: false, error: 'Image not in allowed list' },
        { status: 400 }
      );
    }

    // Then check if the image actually exists on the Docker host
    try {
      const image = docker.getImage(imageTag);
      await image.inspect();
      return NextResponse.json({ exists: true });
    } catch (dockerError) {
      // Image doesn't exist on the server
      return NextResponse.json({
        exists: false,
        error: 'Image not found on server. Please build it first.',
      });
    }
  } catch (error) {
    console.error('Error validating Docker image:', error);
    return NextResponse.json({ error: 'Failed to validate image' }, { status: 500 });
  }
}
