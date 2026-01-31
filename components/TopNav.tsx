import { getCategories } from '@/lib/db'
import TopNavClient from './TopNavClient'

export default async function TopNav() {
  const categories = await getCategories()

  return <TopNavClient categories={categories} />
}
