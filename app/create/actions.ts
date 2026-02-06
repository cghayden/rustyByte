'use server';

import prisma from '@/lib/db';
import { generateSlug, makeSlugUnique } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { canCreateChallenges, getCurrentUser } from '@/lib/auth';
import { isValidDockerImage } from '@/lib/dockerImages';
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
    const dockerImage = requiresTerminal ? (formData.get('dockerImage') as string) : null;

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
    if (requiresTerminal) {
      if (!dockerImage) {
        throw new Error('Docker image is required for terminal challenges');
      }

      // Check if image is in allowed list
      if (!isValidDockerImage(dockerImage)) {
        throw new Error('Selected Docker image is not in the allowed list');
      }

      // Check if image exists on server
      const imageExists = await validateDockerImageExists(dockerImage);
      if (!imageExists) {
        throw new Error(
          `Docker image "${dockerImage}" not found on server. Please build it first.`
        );
      }
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

    // Create the challenge with all its questions
    const _challenge = await prisma.challenge.create({
      data: {
        categoryId,
        authorId: user.userId,
        title: title.trim(),
        slug,
        prompt: prompt.trim(),
        dockerImage,
        questions: {
          create: questions,
        },
      },
    });

    // Revalidate the category page to show the new challenge
    revalidatePath(`/${categoryId}`);

    // Redirect based on whether files are required
    if (requiresFiles) {
      // Redirect to edit page for file uploads
      redirect(`/${categoryId}/${slug}/edit`);
    } else {
      // Redirect to the completed challenge page
      redirect(`/${categoryId}/${slug}`);
    }
  } catch (error) {
    console.error('Error creating challenge:', error);
    throw error; // Re-throw to show the error to the user
  }
}
