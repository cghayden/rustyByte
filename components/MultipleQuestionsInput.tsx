'use client';

import { useState } from 'react';

interface Question {
  id: string;
  question: string;
  answers: string;
}

export default function MultipleQuestionsInput() {
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', question: '', answers: '' },
  ]);

  const addQuestion = () => {
    const newId = String(questions.length + 1);
    setQuestions([...questions, { id: newId, question: '', answers: '' }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (
    id: string,
    field: 'question' | 'answers',
    value: string
  ) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
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
          className='border border-stone-800 rounded-lg p-4 bg-amber-200'
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
              value={question.question}
              onChange={(e) =>
                updateQuestion(question.id, 'question', e.target.value)
              }
              required
              placeholder={`Enter question ${index + 1}...`}
              className='w-full px-3 py-2 border border-stone-800 bg-amber-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-stone-800'
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
              value={question.answers}
              onChange={(e) =>
                updateQuestion(question.id, 'answers', e.target.value)
              }
              required
              placeholder='answer1, answer2, ANSWER1...'
              className='w-full px-3 py-2 border border-stone-800 bg-amber-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-stone-800'
            />
            <p className='mt-1 text-xs text-gray-500'>
              Separate multiple acceptable answers with commas. Case variations
              are handled automatically.
            </p>
          </div>

          {/* Hidden inputs for form submission */}
          <input
            type='hidden'
            name={`questions[${index}][id]`}
            value={question.id}
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
