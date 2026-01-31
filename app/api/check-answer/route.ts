import { NextRequest, NextResponse } from 'next/server';
import { checkAnswer } from '@/app/[category]/[challenge]/actions';

export async function POST(request: NextRequest) {
  try {
    const { categoryId, challengeSlug, questionId, userAnswer } = await request.json();

    if (!categoryId || !challengeSlug || !questionId || userAnswer === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await checkAnswer(categoryId, challengeSlug, questionId, userAnswer);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking answer:', error);
    return NextResponse.json(
      { error: 'Failed to check answer' },
      { status: 500 }
    );
  }
}
