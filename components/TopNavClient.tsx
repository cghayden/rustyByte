'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Category } from '@/lib/db';
import { useAuth } from './AuthProvider';
import MobileMenu from './MobileMenu';

interface TopNavClientProps {
  categories: Category[];
  challenges: { id: string; slug: string; title: string; categoryId: string }[];
}

export default function TopNavClient({ categories, challenges }: TopNavClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      <header className='border-b border-stone-300 bg-stone-900 backdrop-blur sticky top-0 z-50'>
        <nav className='px-4 md:px-6 lg:px-8 py-3 flex items-center gap-2'>
          {/* Hamburger menu button - mobile only */}
          {user && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className='md:hidden text-neutral-300 hover:text-accent p-2 -ml-2'
              aria-label='Open menu'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              </svg>
            </button>
          )}

          <Link
            href='/'
            className='font-semibold mr-2 shrink-0 text-neutral-300 hover:bg-neutral-300 hover:text-gray-900 px-2 py-1 rounded transition-colors'
          >
            The Rusty Byte
          </Link>

          <div className='ml-auto flex items-center gap-2'>
            {/* Only show create button for ADMIN and AUTHOR roles */}
            {user && (user.role === 'ADMIN' || user.role === 'AUTHOR') && (
              <Link
                href='/create'
                className='px-3 py-1.5 rounded-xl text-sm transition-colors bg-accent text-black hover:bg-accent-light flex items-center gap-1 font-medium'
                title='Create New Challenge'
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4v16m8-8H4'
                  />
                </svg>
                <span className='hidden sm:inline'>New</span>
              </Link>
            )}

            {!loading && (
              <div className='flex items-center gap-2'>
                {user ? (
                  <>
                    <Link
                      href='/dashboard'
                      className='hidden sm:flex px-4 py-2 rounded-xl text-sm transition-colors bg-tavern-light text-accent hover:bg-tavern-medium border border-accent/30 items-center gap-2'
                    >
                      <span>Dashboard</span>
                      <span className='hidden lg:inline opacity-80'>({user.username})</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className='hidden sm:block px-3 py-1.5 rounded-xl text-sm transition-colors bg-tavern-light text-accent hover:bg-tavern-medium border border-accent/30'
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href='/login'
                      className='px-3 py-1.5 rounded-xl text-sm transition-colors bg-neutral-700 text-white hover:bg-neutral-600'
                    >
                      Login
                    </Link>
                    <Link
                      href='/register'
                      className='px-3 py-1.5 rounded-xl text-sm transition-colors bg-accent text-black hover:bg-accent-light font-medium'
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>

      <MobileMenu
        categories={categories}
        challenges={challenges}
        user={user}
        onLogout={handleLogout}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
