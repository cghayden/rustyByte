'use server';

import prisma from '@/lib/db';
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

export async function updateChallenge(formData: FormData) {
  // AUTHORIZATION: Only ADMIN and AUTHOR roles can edit challenges
  const hasPermission = await canCreateChallenges();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to edit challenges');
  }

  try {
    const challengeId = formData.get('challengeId') as string;
    const categoryId = formData.get('categoryId') as string;
    const title = formData.get('title') as string;
    const prompt = formData.get('prompt') as string;
    const requiresTerminal = formData.get('requiresTerminal') === 'on';
    const dockerImage = requiresTerminal ? (formData.get('dockerImage') as string) : null;

    // Basic validation
    if (!challengeId) {
      throw new Error('Challenge ID is required');
    }

    if (!title || title.trim().length === 0) {
      throw new Error('Challenge title is required');
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

    // Get all questions data
    const questionIds: string[] = [];
    const questionTexts: string[] = [];
    const questionAnswers: string[][] = [];

    let questionIndex = 0;
    while (formData.get(`question-${questionIndex}-id`) !== null) {
      const questionId = formData.get(`question-${questionIndex}-id`) as string;
      const questionText = formData.get(`question-${questionIndex}-text`) as string;
      const answersJson = formData.get(`question-${questionIndex}-answers`) as string;

      questionIds.push(questionId);
      questionTexts.push(questionText);
      questionAnswers.push(JSON.parse(answersJson));

      questionIndex++;
    }

    // Update challenge
    await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        title: title.trim(),
        prompt: prompt.trim(),
        dockerImage,
      },
    });

    // Update questions
    for (let i = 0; i < questionIds.length; i++) {
      const questionId = questionIds[i];
      const questionText = questionTexts[i];
      const answers = questionAnswers[i];

      await prisma.question.update({
        where: { id: parseInt(questionId) },
        data: {
          challengeQuestion: questionText,
          answers: answers,
        },
      });
    }

    // Revalidate the challenge page
    revalidatePath(`/${categoryId}`);
  } catch (error) {
    console.error('Error updating challenge:', error);
    throw error;
  }

  // Get the challenge to redirect
  const challengeId = formData.get('challengeId') as string;
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { slug: true, categoryId: true },
  });

  if (challenge) {
    redirect(`/${challenge.categoryId}/${challenge.slug}`);
  } else {
    redirect('/');
  }
}

export async function deleteChallenge(
  challengeId: string
): Promise<{ success: boolean; error?: string }> {
  // AUTHORIZATION: Only ADMIN and AUTHOR roles can delete challenges
  const hasPermission = await canCreateChallenges();
  if (!hasPermission) {
    return {
      success: false,
      error: 'Unauthorized: You do not have permission to delete challenges',
    };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // Get the challenge to check ownership
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { id: true, categoryId: true, authorId: true },
    });

    if (!challenge) {
      return { success: false, error: 'Challenge not found' };
    }

    // Check if user is the author or an admin
    const isAuthor = challenge.authorId === user.userId;
    const userRecord = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true },
    });
    const isAdmin = userRecord?.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return {
        success: false,
        error: 'Only the challenge author or an admin can delete this challenge',
      };
    }

    // Delete the challenge (cascade will handle questions and files)
    await prisma.challenge.delete({
      where: { id: challengeId },
    });

    // Revalidate the category page
    revalidatePath(`/${challenge.categoryId}`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting challenge:', error);
    return { success: false, error: 'Failed to delete challenge' };
  }
}
