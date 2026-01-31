'use server'

import prisma from '@/lib/db'

function normalize(s: string) {
  return (s ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s\u00A0]+/g, ' ')
    .replace(/\s*-\s*/g, '-')
}

export async function checkAnswer(
  categoryId: string,
  challengeSlug: string,
  questionId: string,
  userAnswer: string
): Promise<{ correct: boolean }> {
  // Fetch the challenge with its questions
  const challenge = await prisma.challenge.findUnique({
    where: {
      categoryId_slug: {
        categoryId,
        slug: challengeSlug,
      },
    },
    include: {
      questions: {
        where: {
          questionId,
        },
      },
    },
  })

  if (!challenge || challenge.questions.length === 0) {
    return { correct: false }
  }

  const question = challenge.questions[0]
  const normalizedUserAnswer = normalize(userAnswer)

  // Check if the user's answer matches any of the acceptable answers
  const correct = question.answers.some(
    (answer) => normalize(answer) === normalizedUserAnswer
  )

  return { correct }
}
