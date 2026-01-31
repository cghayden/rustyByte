import { getCategoryById, getChallenges } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'

export default async function CategoryIndex({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const [categoryData, challenges] = await Promise.all([
    getCategoryById(category),
    getChallenges(category),
  ])

  if (!categoryData) return notFound()

  // Redirect to first challenge if available
  if (challenges.length > 0) {
    const firstChallenge = challenges[0]
    redirect(`/${category}/${firstChallenge.slug}`)
  }

  return (
    <div>
      <h1 className='text-xl font-semibold mb-4 text-neutral-300'>
        {categoryData.name}
      </h1>
      <p className='text-neutral-300'>No challenges available yet.</p>
    </div>
  )
}
