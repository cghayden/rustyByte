'use client';

import { useEffect, useState } from 'react';

function keyFor(cat: string, chal: string, qid: string) {
  return `ctf:${cat}:${chal}:${qid}`;
}

export default function AnswerCard({
  categoryId,
  challengeSlug,
  questionId,
  challengeQuestion,
}: {
  categoryId: string;
  challengeSlug: string;
  questionId: string;
  challengeQuestion: string;
}) {
  const storageKey = keyFor(categoryId, challengeSlug, questionId);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<null | 'correct' | 'wrong'>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const { value: v, status: s } = JSON.parse(saved);
        if (typeof v === 'string') setValue(v);
        if (s === 'correct' || s === 'wrong') setStatus(s);
      } catch {}
    }
  }, [storageKey]);

  const check = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          challengeSlug,
          questionId,
          userAnswer: value,
        }),
      });

      const { correct } = await response.json();
      const newStatus = correct ? 'correct' : 'wrong';
      setStatus(newStatus);
      localStorage.setItem(
        storageKey,
        JSON.stringify({ value, status: newStatus })
      );
    } catch (error) {
      console.error('Error checking answer:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const reset = () => {
    setValue('');
    setStatus(null);
    localStorage.removeItem(storageKey);
  };

  return (
    <div className=' p-4'>
      <div className='font-medium text-neutral-300 mb-2'>
        {challengeQuestion}
      </div>
      <div className='flex gap-2 items-center'>
        <input
          className='flex-1 bg-neutral-300 border border-stone-300 rounded-xl px-3 py-2 text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-tavern-secondary'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') check();
          }}
        />
        <button
          onClick={check}
          disabled={isChecking}
          className='px-4 py-2 rounded-xl bg-neutral-300 hover:bg-neutral-300-80 active:bg-neutral-300-60 text-gray-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isChecking ? 'Checking...' : 'Submit'}
        </button>
        <button
          onClick={reset}
          className='px-3 py-2 rounded-xl bg-neutral-300 hover:bg-neutral-300-80 active:bg-neutral-300-60 text-gray-900 transition-colors font-medium'
        >
          Reset
        </button>
      </div>
      {status === 'correct' && (
        <div className='mt-3 text-green-400'>✅ Correct!</div>
      )}
      {status === 'wrong' && (
        <div className='mt-3 text-red-400'>❌ Not quite. Try again.</div>
      )}
    </div>
  );
}
