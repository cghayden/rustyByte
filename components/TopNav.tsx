import { getCategories } from '@/lib/db'
import TopNavClient from './TopNavClient'
import db from '@/lib/db'

export default async function TopNav() {
  const categories = await getCategories()
  
  // Fetch all challenges for mobile menu
  const challenges = await db.challenge.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      categoryId: true,
    },
    orderBy: { title: 'asc' }
  })

  return <TopNavClient categories={categories} challenges={challenges} />
}
