import { getChallenges, getCategoryById } from '@/lib/db'
import SidebarClient from './SidebarClient'

interface SidebarProps {
  categoryId: string
}

export default async function Sidebar({ categoryId }: SidebarProps) {
  const [category, challenges] = await Promise.all([
    getCategoryById(categoryId),
    getChallenges(categoryId),
  ])

  if (!category) return null

  return <SidebarClient category={category} challenges={challenges} />
}
