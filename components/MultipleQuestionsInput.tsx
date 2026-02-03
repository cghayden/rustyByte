'use client';

import { useState } from 'react';

interface Question {
  id: string;
  questionId: string;
  text: string;
  answers: string[];
  answersRaw?: string; // Track raw input for editing
}

interface MultipleQuestionsInputProps {
  initialQuestions?: Question[];
}

export default function MultipleQuestionsInput({ initialQuestions }: MultipleQuestionsInputProps) {
  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions && initialQuestions.length > 0
      ? initialQuestions.map(q => ({
          id: q.id,
          questionId: q.questionId,
          text: q.text,
          answers: q.answers,
          answersRaw: q.answers.join(', '),
        }))
      : [{ id: 'new-0', questionId: '1', text: '', answers: [], answersRaw: '' }]
  );

  const addQuestion = () => {
    const newId = `new-${Date.now()}`;
    const newQuestionId = String(questions.length + 1);
    setQuestions([...questions, { id: newId, questionId: newQuestionId, text: '', answers: [], answersRaw: '' }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: 'text' | 'answersRaw', value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== id) return q;
        if (field === 'answersRaw') {
          // Store raw value and also compute answers array for submission
          const answers = value.split(',').map(a => a.trim()).filter(a => a.length > 0);
          return { ...q, answersRaw: value, answers };
        }
        return { ...q, [field]: value };
      })
    );
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='block font-medium text-gray-700'>Questions & Answers</h2>
      </div>

      {questions.map((question, index) => (
        <div
          key={question.id}
          className='border border-stone-800 rounded-lg p-2 bg-amber-200'
        >
          <div className='flex items-center justify-between mb-3'>
            <h3 className='text-sm font-medium text-gray-700'>
              Question {index + 1}
            </h3>
            {questions.length > 1 && (
              <button
                type='button'
                onClick={() => removeQuestion(question.id)}
                className='px-2 py-1 text-xs text-red-600 hover:text-red-800 focus:outline-none'
              >
                Remove
              </button>
            )}
          </div>

          {/* Question Input */}
          <div className='mb-3'>
            <label
              htmlFor={`question-${question.id}`}
              className='block text-xs font-medium text-gray-600 mb-1'
            >
              Question Text
            </label>
            <input
              type='text'
              id={`question-${question.id}`}
              name={`questions[${index}][question]`}
              value={question.text}
              onChange={(e) =>
                updateQuestion(question.id, 'text', e.target.value)
              }
              required
              placeholder={`Enter question ${index + 1}...`}
              className='text-sm w-full px-3 py-1 border border-stone-800 bg-amber-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-stone-800'
            />
          </div>

          {/* Answers Input */}
          <div>
            <label
              htmlFor={`answers-${question.id}`}
              className='block text-xs font-medium text-gray-600 mb-1'
            >
              Acceptable Answers
            </label>
            <input
              type='text'
              id={`answers-${question.id}`}
              name={`questions[${index}][answers]`}
              value={question.answersRaw ?? ''}
              onChange={(e) =>
                updateQuestion(question.id, 'answersRaw', e.target.value)
              }
              required
              placeholder='answer1, answer2, ANSWER1...'
              className='text-sm w-full px-3 py-1 border border-stone-800 bg-amber-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-stone-800'
            />
            <p className='mt-1 text-xs text-gray-500'>
              Separate multiple acceptable answers with commas. Case variations
              are handled automatically.
            </p>
          </div>

          {/* Hidden inputs for form submission - include question ID for edits */}
          <input
            type='hidden'
            name={`question-${index}-id`}
            value={question.id}
          />
          <input
            type='hidden'
            name={`question-${index}-text`}
            value={question.text}
          />
          <input
            type='hidden'
            name={`question-${index}-answers`}
            value={JSON.stringify(question.answers)}
          />
        </div>
      ))}
      <button
        type='button'
        onClick={addQuestion}
        className='px-3 py-1 text-sm bg-stone-700 text-white rounded-md hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2'
      >
        Add Question
      </button>
    </div>
  );
}
