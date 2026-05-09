/**
 * build-challenge-image.ts
 *
 * Downloads the approved Dockerfile for a challenge from S3 and builds
 * the Docker image on the server. Run this after approving a challenge
 * at /admin/pending.
 *
 * Usage:
 *   npx tsx scripts/build-challenge-image.ts --challengeId=<id>
 *
 * The image will be tagged: challenge-<slug>:latest
 */

import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { config } from 'dotenv';
import path from 'path';

config();

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function main() {
  const args = process.argv.slice(2);
  const challengeIdArg = args.find((a) => a.startsWith('--challengeId='));

  if (!challengeIdArg) {
    console.error('Usage: npx tsx scripts/build-challenge-image.ts --challengeId=<id>');
    process.exit(1);
  }

  const challengeId = challengeIdArg.split('=')[1];

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      dockerImage: true,
      pendingDockerfilePath: true,
    },
  });

  if (!challenge) {
    console.error(`Challenge not found: ${challengeId}`);
    process.exit(1);
  }

  if (challenge.status !== 'ACTIVE') {
    console.error(
      `Challenge "${challenge.title}" is not ACTIVE (status: ${challenge.status}). Approve it first.`
    );
    process.exit(1);
  }

  if (!challenge.pendingDockerfilePath) {
    console.error(`Challenge "${challenge.title}" has no Dockerfile path recorded.`);
    process.exit(1);
  }

  const imageTag = `challenge-${challenge.slug}:latest`;
  console.log(`\nChallenge : ${challenge.title}`);
  console.log(`Image tag : ${imageTag}`);
  console.log(`S3 key    : ${challenge.pendingDockerfilePath}\n`);

  // Download Dockerfile from S3
  console.log('Downloading Dockerfile from S3...');
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: challenge.pendingDockerfilePath,
    })
  );

  const body = await response.Body?.transformToByteArray();
  if (!body) {
    console.error('Failed to download Dockerfile from S3.');
    process.exit(1);
  }

  const tmpPath = path.join(process.cwd(), `.dockerfile-${challenge.id}`);
  writeFileSync(tmpPath, body);
  console.log('Dockerfile downloaded.\n');

  // Build the Docker image
  console.log(`Building image: ${imageTag}`);
  try {
    execSync(`docker build -f "${tmpPath}" -t "${imageTag}" .`, { stdio: 'inherit' });
    console.log(`\n✅ Image built successfully: ${imageTag}`);
  } catch {
    console.error('\n❌ Docker build failed.');
    process.exit(1);
  } finally {
    unlinkSync(tmpPath);
  }

  await prisma.$disconnect();
}

main();
