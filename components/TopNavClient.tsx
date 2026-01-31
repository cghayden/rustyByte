'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Category } from '@/lib/db';
import { useAuth } from './AuthProvider';

interface TopNavClientProps {
  categories: Category[];
}

export default function TopNavClient({ categories }: TopNavClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className='border-b border-stone-300 bg-stone-900 backdrop-blur sticky top-0 z-50'>
      <nav className='px-4 md:px-6 lg:px-8 py-3 flex items-center gap-2'>
        <Link
          href='/'
          className='font-semibold mr-2 shrink-0 text-neutral-300 hover:bg-neutral-300 hover:text-gray-900 px-2 py-1 rounded transition-colors'
        >
          The Rusty Byte
        </Link>
        <div className='flex items-center gap-1'>
          {categories.map((category) => {
            const href = `/${category.id}`;
            const active = isActive(href);
            return (
              <Link
                key={category.id}
                href={href}
                className={
                  `px-3 py-1.5 rounded-xl text-sm whitespace-nowrap transition-colors ` +
                  (active
                    ? 'bg-neutral-300 text-gray-900'
                    : 'bg-tavern-primary text-neutral-300 hover:bg-neutral-300 hover:text-gray-900')
                }
              >
                {category.name}
              </Link>
            );
          })}
        </div>
        <div className='ml-auto flex items-center gap-2'>
          {/* Only show create button for ADMIN and AUTHOR roles */}
          {user && (user.role === 'ADMIN' || user.role === 'AUTHOR') && (
            <Link
              href='/create'
              className='px-3 py-1.5 rounded-xl text-sm transition-colors bg-green-600 text-white hover:bg-green-700 flex items-center gap-1'
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
                    className='px-3 py-1.5 rounded-xl text-sm transition-colors bg-blue-600 text-white hover:bg-blue-700'
                  >
                    Dashboard
                  </Link>
                  <span className='text-neutral-300 text-sm hidden sm:inline'>
                    {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className='px-3 py-1.5 rounded-xl text-sm transition-colors bg-red-600 text-white hover:bg-red-700'
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
                    className='px-3 py-1.5 rounded-xl text-sm transition-colors bg-blue-600 text-white hover:bg-blue-700'
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
  );
}
