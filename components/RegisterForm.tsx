'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(email, username, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-md w-full mx-auto px-4 mt-8'>
      <div className='p-6 bg-tavern-medium rounded-lg shadow-md border border-accent/20'>
        <h2 className='text-2xl font-bold mb-6 text-center'>
          Sign Up
        </h2>

        {error && (
          <div className='mb-4 p-3 bg-red-900/30 border border-red-400/50 text-red-300 rounded'>
            {error}
          </div>
        )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium mb-1'
          >
            Email
          </label>
          <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full px-3 py-2 border border-accent/30 bg-tavern-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-accent'
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor='username'
            className='block text-sm font-medium mb-1'
          >
            Username
          </label>
          <input
            type='text'
            id='username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className='w-full px-3 py-2 border border-accent/30 bg-tavern-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-accent'
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium mb-1'
          >
            Password
          </label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='w-full px-3 py-2 border border-accent/30 bg-tavern-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-accent'
            disabled={loading}
          />
          <p className='mt-1 text-xs opacity-70'>
            Any password is accepted (testing mode)
          </p>
        </div>

        <div>
          <label
            htmlFor='confirmPassword'
            className='block text-sm font-medium mb-1'
          >
            Confirm Password
          </label>
          <input
            type='password'
            id='confirmPassword'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className='w-full px-3 py-2 border border-accent/30 bg-tavern-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-accent'
            disabled={loading}
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-accent text-black py-2 px-4 rounded-md hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 font-semibold'
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className='mt-4 text-center text-sm'>
        Already have an account?{' '}
        <Link href='/login' className='text-accent hover:text-accent-light underline'>
          Sign in
        </Link>
      </p>
      </div>
    </div>
  );
}
