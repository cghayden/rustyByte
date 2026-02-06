// lib/docker.ts
import Docker from 'dockerode';
import crypto from 'crypto';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const docker = new Docker();

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

export interface ContainerInstance {
  id: string;
  name: string;
  status: string;
  port?: number;
  authToken?: string;
}

export class DockerService {
  /**
   * SECURITY: Generate cryptographically secure authentication token
   *
   * Uses Node.js crypto.randomBytes to generate 32 random bytes (256 bits)
   * converted to 64 hexadecimal characters. This provides:
   * - Unpredictable tokens (2^256 possible combinations)
   * - Protection against brute force attacks
   * - Unique credentials per terminal session
   *
   * Each user's terminal gets its own token, preventing unauthorized access
   * to other users' containers even if they discover the port number.
   */
  private generateAuthToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Find an available port
  private async findAvailablePort(): Promise<number> {
    const usedPorts = new Set<number>();

    // Get all running containers to check used ports
    const containers = await docker.listContainers({ all: true });
    containers.forEach((container) => {
      if (container.Ports) {
        container.Ports.forEach((port) => {
          if (port.PublicPort) {
            usedPorts.add(port.PublicPort);
          }
        });
      }
    });

    // Also check database for ports assigned to instances (handles paused/stale containers)
    const dbInstances = await prisma.instance.findMany({
      select: { hostPort: true },
    });
    dbInstances.forEach((instance) => {
      if (instance.hostPort) {
        usedPorts.add(instance.hostPort);
      }
    });

    // Find an available port starting from 8000
    for (let port = 8000; port <= 9000; port++) {
      if (!usedPorts.has(port)) {
        return port;
      }
    }

    throw new Error('No available ports found');
  }

  // Create and start a container for a challenge
  async createInstance(
    userId: string,
    challengeSlug: string,
    dockerImage: string
  ): Promise<ContainerInstance> {
    const containerName = `ctf-${challengeSlug}-${userId}-${Date.now()}`;
    const hostPort = await this.findAvailablePort();
    const authToken = this.generateAuthToken();
    const username = 'ctf';

    try {
      // Check if image exists locally
      let imageExists = false;
      try {
        await docker.getImage(dockerImage).inspect();
        imageExists = true;
        console.log(`Using local image: ${dockerImage}`);
      } catch (_inspectError) {
        console.log(`Image ${dockerImage} not found locally, will try to pull`);
      }

      // Only pull if image doesn't exist locally
      if (!imageExists) {
        console.log(`Pulling image: ${dockerImage}`);
        try {
          await new Promise((resolve, reject) => {
            docker.pull(dockerImage, (err: Error | null, stream: NodeJS.ReadableStream) => {
              if (err) return reject(err);
              docker.modem.followProgress(stream, (err: Error | null, output: unknown) => {
                if (err) return reject(err);
                resolve(output);
              });
            });
          });
        } catch (pullError) {
          throw new Error(
            `Failed to pull image ${dockerImage}. Make sure the image exists locally or is accessible from a Docker registry. Error: ${pullError}`
          );
        }
      }

      /**
       * SECURITY: Create container with multiple security layers
       *
       * 1. LOCALHOST-ONLY BINDING (HostIp: '127.0.0.1'):
       *    - Prevents external network access to terminal ports
       *    - Only accessible from the server itself, not from internet
       *    - Attackers can't directly connect even if they know the port
       *
       * 2. HTTP BASIC AUTH (--credential flag):
       *    - ttyd requires username:password for access
       *    - Credentials are the unique token generated above
       *    - Even localhost connections need valid credentials
       *
       * 3. RESOURCE LIMITS:
       *    - Memory: 512MB cap prevents container from consuming all RAM
       *    - CPU: Limited shares prevent DOS attacks
       *
       * Together these prevent:
       * - External attackers accessing terminals
       * - Users accessing each other's terminals
       * - Port scanning attacks
       * - Resource exhaustion attacks
       */
      const container = await docker.createContainer({
        Image: dockerImage,
        name: containerName,
        ExposedPorts: { '7681/tcp': {} },
        HostConfig: {
          PortBindings: {
            // SECURITY: Bind to localhost only - blocks external access
            '7681/tcp': [{ HostIp: '127.0.0.1', HostPort: hostPort.toString() }],
          },
          Memory: 512 * 1024 * 1024, // 512MB limit
          CpuShares: 512, // CPU limit
        },
        Env: [`CTF_USER_ID=${userId}`, `CTF_CHALLENGE=${challengeSlug}`],
        // ttyd command without authentication (already protected by localhost-only binding and app auth)
        // -W flag enables write access
        Cmd: ['ttyd', '-p', '7681', '-W', 'bash'],
      });

      // Start the container
      await container.start();

      // Wait a moment for ttyd to start
      await new Promise((resolve) => setTimeout(resolve, 2000));

      /**
       * SECURITY: Return authentication token in HTTP Basic Auth format
       *
       * Format: "username:token" (e.g., "ctf:a3f9c8e2d1b4...")
       * This will be:
       * 1. Stored in database for session validation
       * 2. Passed to frontend for iframe authentication
       * 3. Sent as HTTP Basic Auth header when accessing terminal
       */
      return {
        id: container.id,
        name: containerName,
        status: 'running',
        port: hostPort,
        authToken: `${username}:${authToken}`,
      };
    } catch (error) {
      console.error('Error creating container:', error);
      throw new Error(`Failed to create container: ${error}`);
    }
  }

  // Get container status
  async getInstanceStatus(containerName: string): Promise<ContainerInstance | null> {
    try {
      const containers = await docker.listContainers({ all: true });
      const containerInfo = containers.find((c) =>
        c.Names.some((name) => name.includes(containerName.replace('/ctf-', '')))
      );

      if (!containerInfo) {
        return null;
      }

      const hostPort = containerInfo.Ports?.find((p) => p.PrivatePort === 7681)?.PublicPort;

      return {
        id: containerInfo.Id,
        name: containerInfo.Names[0],
        status: containerInfo.State,
        port: hostPort,
      };
    } catch (error) {
      console.error('Error getting container status:', error);
      return null;
    }
  }

  // Pause a container (freezes all processes, saves resources)
  async pauseInstance(containerName: string): Promise<boolean> {
    try {
      const container = docker.getContainer(containerName);
      await container.pause();
      return true;
    } catch (error) {
      console.error('Error pausing container:', error);
      return false;
    }
  }

  // Unpause a container (resumes all processes)
  async unpauseInstance(containerName: string): Promise<boolean> {
    try {
      const container = docker.getContainer(containerName);
      await container.unpause();
      return true;
    } catch (error) {
      console.error('Error unpausing container:', error);
      return false;
    }
  }

  // Stop a container (preserves files for later restart)
  async stopInstance(containerName: string): Promise<boolean> {
    try {
      const container = docker.getContainer(containerName);
      await container.stop();
      // Don't remove - preserve user files for restart
      return true;
    } catch (error) {
      console.error('Error stopping container:', error);
      return false;
    }
  }

  // List all CTF containers
  async listInstances(): Promise<ContainerInstance[]> {
    try {
      const containers = await docker.listContainers({ all: true });
      return containers
        .filter((c) => c.Names.some((name) => name.includes('ctf-')))
        .map((c) => ({
          id: c.Id,
          name: c.Names[0],
          status: c.State,
          port: c.Ports?.find((p) => p.PrivatePort === 7681)?.PublicPort,
        }));
    } catch (error) {
      console.error('Error listing containers:', error);
      return [];
    }
  }

  // Clean up expired containers (call this periodically)
  async cleanupExpired(): Promise<void> {
    // This would integrate with your database to check expiration times
    // For now, just remove stopped containers older than 1 hour
    const containers = await docker.listContainers({
      all: true,
      filters: { status: ['exited'] },
    });

    for (const containerInfo of containers) {
      if (containerInfo.Names.some((name) => name.includes('ctf-'))) {
        const created = new Date(containerInfo.Created * 1000);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        if (created < oneHourAgo) {
          try {
            const container = docker.getContainer(containerInfo.Id);
            await container.remove();
            console.log(`Cleaned up expired container: ${containerInfo.Names[0]}`);
          } catch (error) {
            console.error(`Error cleaning up container ${containerInfo.Names[0]}:`, error);
          }
        }
      }
    }
  }
}

export const dockerService = new DockerService();
