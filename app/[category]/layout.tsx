import { getCategoryById, getCategories } from '@/lib/db';
import Sidebar from '@/components/Sidebar';
import { notFound } from 'next/navigation';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categoryData = await getCategoryById(category);
  if (!categoryData) return notFound();

  return (
    <div className="md:flex w-full h-full">
      <Sidebar categoryId={categoryData.id} />
      <section
        id="challenge-container"
        className="flex-1 px-4 py-4 md:px-6 md:py-6 bg-stone-800 overflow-y-auto"
      >
        {children}
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.id }));
}
