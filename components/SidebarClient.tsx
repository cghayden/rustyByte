'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { Category } from '@/lib/db'

interface SidebarClientProps {
  categories: Category[]
  challenges: { id: string; slug: string; title: string; categoryId: string }[]
  initialCategoryId?: string
}

export default function SidebarClient({
  categories,
  challenges,
  initialCategoryId,
}: SidebarClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialCategoryId || categories[0]?.id || ''
  )

  // Update selected category when URL changes
  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCategoryId(initialCategoryId)
    }
  }, [initialCategoryId])

  const filteredChallenges = challenges.filter(ch => ch.categoryId === selectedCategoryId)

  // Don't render sidebar if no categories
  if (categories.length === 0) {
    console.log('No categories - not rendering')
    return null
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    router.push(`/${categoryId}`)
  }

  return (
    <aside
      id='sidebar'
      className='hidden md:flex w-full md:w-48 shrink-0 md:border-r border-stone-300 p-4 md:py-6 castle-wall h-full flex-col'
    >
      <div className='flex-1 overflow-y-auto'>
        {/* Category dropdown */}
        <select
          value={selectedCategoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className='w-full mb-4 px-3 py-2 rounded-xl text-sm bg-tavern-light text-accent border border-accent/30 hover:bg-tavern-medium focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors cursor-pointer'
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <ul className='space-y-1'>
          {filteredChallenges.length === 0 && (
            <li className='text-neutral-300 text-sm'>No challenges yet.</li>
          )}
          {filteredChallenges.map((ch) => {
            const href = `/${selectedCategoryId}/${ch.slug}`
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
