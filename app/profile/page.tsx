'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setNewUsername(user.username);
    }
  }, [user]);

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    if (newUsername === user?.username) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update username');
        return;
      }

      setSuccess('Username updated successfully! Please log out and back in to see the change everywhere.');
      setIsEditing(false);
      
      // Refresh user data if the function exists
      if (refreshUser) {
        await refreshUser();
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNewUsername(user?.username || '');
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-accent'></div>
          <p className='mt-4 text-gray-400'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className='min-h-screen'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='py-6'>
          <div className='flex items-center justify-between mb-8'>
            <h1 className='text-3xl font-bold'>Profile</h1>
            <Link
              href='/dashboard'
              className='bg-accent text-black px-4 py-2 rounded-md hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent'
            >
              Back to Dashboard
            </Link>
          </div>

          {error && (
            <div className='mb-4 p-3 bg-red-900/30 border border-red-400/50 text-red-300 rounded'>
              {error}
            </div>
          )}

          {success && (
            <div className='mb-4 p-3 bg-green-900/30 border border-green-400/50 text-green-300 rounded'>
              {success}
            </div>
          )}

          <div className='bg-tavern-medium shadow rounded-lg border border-accent/20'>
            <div className='px-4 py-5 sm:p-6'>
              <h2 className='text-lg font-medium mb-4'>
                Profile Information
              </h2>

              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <div>
                  <label className='block text-sm font-medium text-gray-300'>
                    Username
                  </label>
                  {isEditing ? (
                    <div className='mt-1'>
                      <input
                        type='text'
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className='w-full px-3 py-2 border border-accent/30 bg-tavern-dark rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-accent'
                        disabled={saving}
                      />
                      <p className='mt-1 text-xs text-gray-400'>
                        Letters, numbers, underscores, and hyphens only. 3-30 characters.
                      </p>
                    </div>
                  ) : (
                    <div className='mt-1 text-sm bg-tavern-dark px-3 py-2 rounded-md border border-accent/30'>
                      {user.username}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          <div className='mt-6 bg-tavern-medium shadow rounded-lg border border-accent/20'>
            <div className='px-4 py-5 sm:p-6'>
              <h2 className='text-lg font-medium mb-4'>
                Account Settings
              </h2>

              <div className='flex flex-wrap gap-3'>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveUsername}
                      disabled={saving}
                      className='bg-accent text-black px-4 py-2 rounded-md hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50'
                    >
                      {saving ? 'Saving...' : 'Save Username'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className='bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50'
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className='bg-accent text-black px-4 py-2 rounded-md hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent'
                  >
                    Change Username
                  </button>
                )}
                <button
                  disabled
                  className='bg-gray-600 text-gray-400 px-4 py-2 rounded-md cursor-not-allowed'
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
