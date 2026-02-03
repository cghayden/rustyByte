'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { canCreateChallenges } from '@/lib/auth';

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
