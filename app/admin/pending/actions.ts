'use server';

import db from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { moveS3Object } from '@/lib/s3';

export async function approveChallenge(formData: FormData) {
  if (!(await isAdmin())) throw new Error('Unauthorized');

  const challengeId = formData.get('challengeId') as string;

  const challenge = await db.challenge.findUnique({
    where: { id: challengeId },
    select: { pendingDockerfilePath: true, categoryId: true, slug: true },
  });

  if (!challenge) throw new Error('Challenge not found');

  // Move Dockerfile from quarantine to permanent location
  let dockerfilePath: string | null = null;
  if (challenge.pendingDockerfilePath) {
    const destKey = `challenges/${challenge.categoryId}/${challenge.slug}/dockerfile`;
    await moveS3Object(challenge.pendingDockerfilePath, destKey);
    dockerfilePath = destKey;
  }

  // Derive image tag deterministically from the challenge slug
  const dockerImage = challenge.pendingDockerfilePath
    ? `challenge-${challenge.slug}:latest`
    : null;

  await db.challenge.update({
    where: { id: challengeId },
    data: {
      status: 'ACTIVE',
      pendingFileReview: false,
      rejectionNote: null,
      pendingDockerfilePath: dockerfilePath,
      ...(dockerImage ? { dockerImage } : {}),
    },
  });

  revalidatePath('/admin/pending');
}

export async function rejectChallenge(formData: FormData) {
  if (!(await isAdmin())) throw new Error('Unauthorized');

  const challengeId = formData.get('challengeId') as string;
  const note = (formData.get('rejectionNote') as string)?.trim();

  if (!note) throw new Error('A rejection note is required');

  await db.challenge.update({
    where: { id: challengeId },
    data: {
      status: 'REJECTED',
      rejectionNote: note,
    },
  });

  revalidatePath('/admin/pending');
}
