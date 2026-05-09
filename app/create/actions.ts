'use server';

import prisma from '@/lib/db';
import { generateSlug, makeSlugUnique } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { canCreateChallenges, getCurrentUser } from '@/lib/auth';
import { isValidDockerImage } from '@/lib/dockerImages';
import { s3Client, S3_BUCKET_NAME } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

/**
 * Validates that a Docker image exists on the server
 */
async function validateDockerImageExists(imageTag: string): Promise<boolean> {
  try {
    const image = docker.getImage(imageTag);
    await image.inspect();
    return true;
  } catch {
    return false;
  }
}

export async function createChallenge(formData: FormData) {
  // AUTHORIZATION: Only ADMIN and AUTHOR roles can create challenges
  const hasPermission = await canCreateChallenges();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to create challenges');
  }

  // Get current user for authorId
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  try {
    const categoryId = formData.get('categoryId') as string;
    const title = formData.get('title') as string;
    const prompt = formData.get('prompt') as string;
    const requiresFiles = formData.get('requiresFiles') === 'on';
    const requiresTerminal = formData.get('requiresTerminal') === 'on';
    const membersOnly = formData.get('membersOnly') === 'on';
    const dockerfileUpload = requiresTerminal
      ? (formData.get('dockerfileUpload') as File | null)
      : null;
    // dockerImage is not assigned at creation time — set by admin on approval
    const dockerImage = null;

    // Basic validation
    if (!title || title.trim().length === 0) {
      throw new Error('Challenge title is required');
    }

    if (!categoryId) {
      throw new Error('Category is required');
    }

    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Challenge prompt is required');
    }

    // Validate Docker image if terminal is required
    if (requiresTerminal && !dockerfileUpload) {
      throw new Error('A Dockerfile is required for terminal challenges');
    }

    // Check if title already exists
    const existingChallenge = await prisma.challenge.findFirst({
      where: { title: title.trim() },
    });

    if (existingChallenge) {
      throw new Error(
        `A challenge with the title "${title.trim()}" already exists. Please choose a different title.`
      );
    }

    // Generate slug from title
    const baseSlug = generateSlug(title.trim());

    if (!baseSlug) {
      throw new Error(
        'Could not generate a valid slug from the title. Please use a title with letters or numbers.'
      );
    }

    // Get existing slugs to ensure uniqueness
    const existingSlugs = await prisma.challenge
      .findMany({
        select: { slug: true },
      })
      .then((challenges) => challenges.map((c) => c.slug));

    const slug = makeSlugUnique(baseSlug, existingSlugs);

    // Extract questions from form data
    const questions: Array<{
      questionId: string;
      challengeQuestion: string;
      answers: string[];
    }> = [];

    // Parse multiple questions from form data
    let questionIndex = 0;
    while (formData.get(`questions[${questionIndex}][question]`)) {
      const questionText = formData.get(`questions[${questionIndex}][question]`) as string;
      const answersInput = formData.get(`questions[${questionIndex}][answers]`) as string;
      const questionId =
        (formData.get(`questions[${questionIndex}][id]`) as string) || `q${questionIndex + 1}`;

      if (questionText && answersInput) {
        // Parse comma-separated answers into an array
        const answers = answersInput
          .split(',')
          .map((answer) => answer.trim())
          .filter((answer) => answer.length > 0);

        questions.push({
          questionId,
          challengeQuestion: questionText,
          answers,
        });
      }

      questionIndex++;
    }

    if (questions.length === 0) {
      throw new Error('At least one question is required');
    }

    // Determine initial status:
    // Goes ACTIVE immediately only if no files and no dockerfile needed
    const needsReview = requiresFiles || !!dockerfileUpload;
    const initialStatus = needsReview ? 'PENDING' : 'ACTIVE';

    // Create the challenge
    const challenge = await prisma.challenge.create({
      data: {
        categoryId,
        authorId: user.userId,
        title: title.trim(),
        slug,
        prompt: prompt.trim(),
        dockerImage,
        membersOnly,
        status: initialStatus,
        pendingFileReview: needsReview,
        questions: {
          create: questions,
        },
      },
    });

    // Upload dockerfile to quarantine if provided
    if (dockerfileUpload && dockerfileUpload.size > 0) {
      const key = `quarantine/${challenge.id}/dockerfile`;
      const buffer = Buffer.from(await dockerfileUpload.arrayBuffer());
      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: 'text/plain',
          Metadata: {
            challengeId: challenge.id,
            uploadedBy: user.userId,
          },
        })
      );
      await prisma.challenge.update({
        where: { id: challenge.id },
        data: { pendingDockerfilePath: key },
      });
    }

    // Revalidate the category page to show the new challenge
    revalidatePath(`/${categoryId}`);

    // Redirect based on status and file requirements
    if (initialStatus === 'ACTIVE') {
      redirect(`/${categoryId}/${slug}`);
    } else if (requiresFiles) {
      // Go to edit page so author can upload challenge files
      redirect(`/${categoryId}/${slug}/edit`);
    } else {
      // Dockerfile-only pending — show the challenge page (will show pending state)
      redirect(`/${categoryId}/${slug}`);
    }
  } catch (error) {
    console.error('Error creating challenge:', error);
    throw error; // Re-throw to show the error to the user
  }
}
