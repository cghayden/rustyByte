import { getCategories } from '@/lib/db';
import SidebarClient from './SidebarClient';
import db from '@/lib/db';
import { getCurrentUserWithRole } from '@/lib/auth';

interface SidebarProps {
  categoryId?: string;
}

export default async function Sidebar({ categoryId }: SidebarProps) {
  const [categories, currentUser] = await Promise.all([getCategories(), getCurrentUserWithRole()]);

  const canSeeMembersOnly = currentUser?.role === 'ADMIN' || currentUser?.role === 'BCC_CTFCLUB';

  // Fetch challenges, hiding members-only ones from regular users
  const challenges = await db.challenge.findMany({
    where: canSeeMembersOnly ? undefined : { membersOnly: false },
    select: {
      id: true,
      slug: true,
      title: true,
      categoryId: true,
    },
    orderBy: { title: 'asc' },
  });

  return (
    <SidebarClient categories={categories} challenges={challenges} initialCategoryId={categoryId} />
  );
}
