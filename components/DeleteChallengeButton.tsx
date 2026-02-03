'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteChallenge } from '@/app/[category]/[challenge]/edit/actions';

interface DeleteChallengeButtonProps {
  challengeId: string;
  challengeTitle: string;
  canDelete: boolean;
}

export default function DeleteChallengeButton({ 
  challengeId, 
  challengeTitle,
  canDelete 
}: DeleteChallengeButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  if (!canDelete) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');

    const result = await deleteChallenge(challengeId);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Failed to delete challenge');
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  if (isConfirming) {
    return (
      <div className='bg-red-900/30 border border-red-500/50 rounded-lg p-3'>
        <p className='text-red-300 text-sm mb-2'>
          Are you sure you want to delete &quot;{challengeTitle}&quot;? This action cannot be undone.
        </p>
        {error && (
          <p className='text-red-400 text-sm mb-2'>{error}</p>
        )}
        <div className='flex gap-2'>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className='px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50'
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
          <button
            onClick={() => {
              setIsConfirming(false);
              setError('');
            }}
            disabled={isDeleting}
            className='px-3 py-1.5 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-500 disabled:opacity-50'
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className='px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700'
    >
      Delete Challenge
    </button>
  );
}
