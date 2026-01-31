'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuth();
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

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='py-6'>
          <div className='flex items-center justify-between mb-8'>
            <h1 className='text-3xl font-bold text-gray-900'>Profile</h1>
            <Link
              href='/dashboard'
              className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              Back to Dashboard
            </Link>
          </div>

          <div className='bg-white shadow rounded-lg'>
            <div className='px-4 py-5 sm:p-6'>
              <h2 className='text-lg font-medium text-gray-900 mb-4'>
                Profile Information
              </h2>

              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Email Address
                  </label>
                  <div className='mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border'>
                    {user.email}
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Username
                  </label>
                  <div className='mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border'>
                    {user.username}
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    User ID
                  </label>
                  <div className='mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border font-mono'>
                    {user.id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-6 bg-white shadow rounded-lg'>
            <div className='px-4 py-5 sm:p-6'>
              <h2 className='text-lg font-medium text-gray-900 mb-4'>
                Account Settings
              </h2>
              <p className='text-sm text-gray-600 mb-4'>
                Profile editing and password changes will be available in a
                future update.
              </p>

              <div className='flex space-x-3'>
                <button
                  disabled
                  className='bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed'
                >
                  Edit Profile (Coming Soon)
                </button>
                <button
                  disabled
                  className='bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed'
                >
                  Change Password (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
