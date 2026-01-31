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
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
          <p className='mt-4 text-gray-600'>Loading...</p>
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
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='py-6'>
          <div className='flex justify-between items-center'>
            <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
            <div className='flex items-center space-x-4'>
              <span className='text-sm text-gray-600'>
                Welcome, <strong>{user.username}</strong>
              </span>
              <button
                onClick={handleLogout}
                className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500'
              >
                Logout
              </button>
            </div>
          </div>

          <div className='mt-8'>
            <div className='bg-white shadow rounded-lg p-6'>
              <h2 className='text-xl font-semibold text-gray-800 mb-4'>
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

            <div className='mt-6 bg-white shadow rounded-lg p-6'>
              <h2 className='text-xl font-semibold text-gray-800 mb-4'>
                Quick Actions
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Link
                  href='/'
                  className='block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors'
                >
                  <h3 className='font-medium text-blue-900'>Challenges</h3>
                  <p className='text-sm text-blue-600'>
                    Browse available challenges
                  </p>
                </Link>
                <Link
                  href='/profile'
                  className='block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors'
                >
                  <h3 className='font-medium text-green-900'>Profile</h3>
                  <p className='text-sm text-green-600'>Manage your profile</p>
                </Link>
                {/* Only show create challenge link for ADMIN and AUTHOR roles */}
                {(user.role === 'ADMIN' || user.role === 'AUTHOR') && (
                  <Link
                    href='/create'
                    className='block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors'
                  >
                    <h3 className='font-medium text-purple-900'>
                      Create Challenge
                    </h3>
                    <p className='text-sm text-purple-600'>
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
