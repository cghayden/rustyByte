import { getCategories } from '@/lib/db'
import SidebarClient from './SidebarClient'
import db from '@/lib/db'

interface SidebarProps {
  categoryId?: string
}

export default async function Sidebar({ categoryId }: SidebarProps) {
  const categories = await getCategories()
  
  // Fetch all challenges
  const challenges = await db.challenge.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      categoryId: true,
    },
    orderBy: { title: 'asc' }
  })

  console.log('Sidebar - categories:', categories.length, 'challenges:', challenges.length, 'categoryId:', categoryId)

  return <SidebarClient 
    categories={categories} 
    challenges={challenges}
    initialCategoryId={categoryId}
  />
}
