/**
 * Docker Images Configuration
 *
 * Naming Convention:
 * - Dockerfile: dockerfiles/Dockerfile.<image-name>
 * - Image tag: <image-name>:latest
 *
 * Example:
 * - Dockerfile: dockerfiles/Dockerfile.linux-basic
 * - Image: linux-basic:latest
 *
 * To add a new image:
 * 1. Create the Dockerfile in /dockerfiles/Dockerfile.<name>
 * 2. Add an entry to this array
 * 3. Build on the server: docker build -f dockerfiles/Dockerfile.<name> -t <name>:latest .
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
