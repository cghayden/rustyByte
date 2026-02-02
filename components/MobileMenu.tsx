'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Category } from '@/lib/db';

interface Challenge {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
}

interface MobileMenuProps {
  categories: Category[];
  challenges: Challenge[];
  user: any;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({
  categories,
  challenges,
  user,
  onLogout,
  isOpen,
  onClose,
}: MobileMenuProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const router = useRouter();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/50 z-40 md:hidden'
        onClick={onClose}
      />

      {/* Slide-out menu */}
      <div className='fixed top-0 left-0 h-full w-72 bg-tavern-medium z-50 md:hidden overflow-y-auto shadow-xl border-r border-accent/20'>
        <div className='p-4'>
          {/* Close button */}
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-bold text-accent'>Menu</h2>
            <button
              onClick={onClose}
              className='text-accent hover:text-accent-light p-2'
              aria-label='Close menu'
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
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {/* Categories and Challenges */}
          {user && (
            <div className='mb-6'>
              <h3 className='text-xs uppercase tracking-wide text-accent-dark mb-3'>
                Challenges
              </h3>
              <div className='space-y-2'>
                {categories.map((category) => {
                  const categoryChalls = challenges.filter(
                    (c) => c.categoryId === category.id
                  );
                  const isExpanded = expandedCategory === category.id;

                  return (
                    <div key={category.id}>
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className='w-full flex items-center justify-between px-3 py-2 rounded-lg bg-tavern-dark hover:bg-tavern-light text-accent transition-colors'
                      >
                        <span className='font-medium'>{category.name}</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </button>

                      {isExpanded && categoryChalls.length > 0 && (
                        <div className='ml-4 mt-1 space-y-1'>
                          {categoryChalls.map((challenge) => (
                            <button
                              key={challenge.id}
                              onClick={() =>
                                handleNavigation(
                                  `/${category.id}/${challenge.slug}`
                                )
                              }
                              className='w-full text-left px-3 py-2 rounded-lg text-sm bg-tavern-dark/50 hover:bg-tavern-light text-accent-light hover:text-accent transition-colors'
                            >
                              {challenge.title}
                            </button>
                          ))}
                        </div>
                      )}

                      {isExpanded && categoryChalls.length === 0 && (
                        <div className='ml-4 mt-1 px-3 py-2 text-sm text-accent-dark'>
                          No challenges yet
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Auth buttons */}
          <div className='border-t border-accent/20 pt-4 space-y-2'>
            {user ? (
              <>
                {(user.role === 'ADMIN' || user.role === 'AUTHOR') && (
                  <button
                    onClick={() => handleNavigation('/create')}
                    className='w-full px-4 py-2 rounded-lg bg-accent text-black hover:bg-accent-light transition-colors font-medium text-sm'
                  >
                    Create Challenge
                  </button>
                )}
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className='w-full px-4 py-2 rounded-lg bg-tavern-light text-accent hover:bg-tavern-dark border border-accent/30 transition-colors text-sm'
                >
                  Dashboard ({user.username})
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className='w-full px-4 py-2 rounded-lg bg-tavern-light text-accent hover:bg-tavern-dark border border-accent/30 transition-colors text-sm'
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation('/login')}
                  className='w-full px-4 py-2 rounded-lg bg-tavern-light text-accent hover:bg-tavern-dark border border-accent/30 transition-colors text-sm'
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigation('/register')}
                  className='w-full px-4 py-2 rounded-lg bg-accent text-black hover:bg-accent-light transition-colors font-medium text-sm'
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
