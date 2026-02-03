'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}

export default function SubmitButton({ 
  children, 
  className = '', 
  pendingText = 'Saving...' 
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type='submit'
      disabled={pending}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
