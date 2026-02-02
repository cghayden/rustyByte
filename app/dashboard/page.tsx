'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-accent'></div>
          <p className='mt-4'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className='min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='py-6'>
          <div className='flex justify-between items-center'>
            <h1 className='text-3xl font-bold'>Dashboard</h1>
            <div className='flex items-center space-x-4'>
              <span className='text-sm'>
                Welcome, <strong>{user.username}</strong>
              </span>
              <button
                onClick={handleLogout}
                className='bg-tavern-light text-accent px-4 py-2 rounded-md hover:bg-tavern-medium focus:outline-none focus:ring-2 focus:ring-accent border border-accent/30'
              >
                Logout
              </button>
            </div>
          </div>

          <div className='mt-8'>
            <div className='bg-tavern-medium shadow rounded-lg p-6 border border-accent/20'>
              <h2 className='text-xl font-semibold mb-4'>
                User Information
              </h2>
              <div className='space-y-2'>
                <p>
                  <span className='font-medium'>Email:</span> {user.email}
                </p>
                <p>
                  <span className='font-medium'>Username:</span> {user.username}
                </p>
                <p>
                  <span className='font-medium'>User ID:</span> {user.id}
                </p>
              </div>
            </div>

            <div className='mt-6 bg-tavern-medium shadow rounded-lg p-6 border border-accent/20'>
              <h2 className='text-xl font-semibold mb-4'>
                Quick Actions
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Link
                  href='/'
                  className='block p-4 bg-tavern-dark rounded-lg hover:bg-accent/10 transition-colors border border-accent/30'
                >
                  <h3 className='font-medium text-accent'>Challenges</h3>
                  <p className='text-sm opacity-80'>
                    Browse available challenges
                  </p>
                </Link>
                <Link
                  href='/profile'
                  className='block p-4 bg-tavern-dark rounded-lg hover:bg-accent/10 transition-colors border border-accent/30'
                >
                  <h3 className='font-medium text-accent'>Profile</h3>
                  <p className='text-sm opacity-80'>Manage your profile</p>
                </Link>
                {/* Only show create challenge link for ADMIN and AUTHOR roles */}
                {(user.role === 'ADMIN' || user.role === 'AUTHOR') && (
                  <Link
                    href='/create'
                    className='block p-4 bg-tavern-dark rounded-lg hover:bg-accent/10 transition-colors border border-accent/30'
                  >
                    <h3 className='font-medium text-accent'>
                      Create Challenge
                    </h3>
                    <p className='text-sm opacity-80'>
                      Create a new challenge
                    </p>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
