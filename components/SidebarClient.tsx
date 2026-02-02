'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { Category, ChallengeWithDetails } from '@/lib/db'

interface SidebarClientProps {
  category: Category
  challenges: ChallengeWithDetails[]
}

export default function SidebarClient({
  category,
  challenges,
}: SidebarClientProps) {
  const pathname = usePathname()

  return (
    <aside
      id='sidebar'
      className='w-full md:w-48 shrink-0 md:border-r border-stone-300 p-4 md:py-6 castle-wall h-full flex flex-col'
    >
      <div className='flex-1 overflow-y-auto'>
        <h2 className='text-sm uppercase tracking-wide text-neutral-300 mb-2'>
          {category.name}
        </h2>
        <ul className='space-y-1'>
          {challenges.length === 0 && (
            <li className='text-neutral-300 text-sm'>No challenges yet.</li>
          )}
          {challenges.map((ch) => {
            const href = `/${category.id}/${ch.slug}`
            const active = pathname === href
            return (
              <li key={ch.slug}>
                <Link
                  href={href}
                  className={
                    `block px-3 py-2 rounded-xl text-sm transition-colors backdrop-blur-sm ` +
                    (active
                      ? 'bg-neutral-300 text-gray-900'
                      : 'bg-black/20 text-neutral-300 hover:bg-neutral-300 hover:text-gray-900')
                  }
                >
                  {ch.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Logo at bottom of sidebar */}
      <div className='mt-4 flex justify-center shrink-0'>
        <Image
          src='/rustyByteLogoFull.png'
          alt='The Rusty Byte Logo'
          width={150}
          height={150}
          className='object-contain opacity-90 hover:opacity-100 transition-opacity'
          unoptimized
        />
      </div>
    </aside>
  )
}
