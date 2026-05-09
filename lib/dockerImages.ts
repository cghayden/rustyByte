/**
 * Docker Images Configuration
 *
 * This file is no longer used for challenge-specific Docker images.
 * Challenge images are now automatically tagged from the challenge slug:
 *   challenge-<slug>:latest
 *
 * When an ADMIN approves a challenge Dockerfile at /admin/pending, the tag
 * is assigned automatically. To build the image on the server, SSH in and run:
 *   npx tsx scripts/build-challenge-image.ts --challengeId=<id>
 *
 * The script will:
 *   1. Download the approved Dockerfile from S3
 *   2. Build the image tagged as challenge-<slug>:latest
 *   3. Clean up the temp file
 *
 * ---
 *
 * The array below is for any shared/base images that are NOT tied to a specific
 * challenge (e.g., a generic Linux sandbox). These are built manually:
 *   docker build -f dockerfiles/Dockerfile.<name> -t <name>:latest .
 */

export interface DockerImageConfig {
  /** The image tag (e.g., "linux-basic:latest") */
  tag: string;
  /** Display name shown in the dropdown */
  name: string;
  /** Brief description of what this environment provides */
  description: string;
}

export const availableDockerImages: DockerImageConfig[] = [
  {
    tag: 'linux-test:latest',
    name: 'Basic Linux Terminal',
    description: 'Alpine Linux with common utilities for basic Linux challenges',
  },
  // Add more images here as you create them:
  // {
  //   tag: 'linux-web:latest',
  //   name: 'Web Exploitation',
  //   description: 'Environment with web tools (curl, wget, netcat, etc.)',
  // },
  // {
  //   tag: 'linux-crypto:latest',
  //   name: 'Cryptography Tools',
  //   description: 'Environment with crypto tools (openssl, hashcat, john, etc.)',
  // },
];

/**
 * Get a Docker image config by tag
 */
export function getDockerImageByTag(tag: string): DockerImageConfig | undefined {
  return availableDockerImages.find((img) => img.tag === tag);
}

/**
 * Check if a Docker image tag is in our allowed list
 */
export function isValidDockerImage(tag: string): boolean {
  return availableDockerImages.some((img) => img.tag === tag);
}
