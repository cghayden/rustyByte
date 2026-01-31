import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import db from '@/lib/db';
import JsonViewer from './JsonViewer';

export default async function AdminViewDataPage() {
  // Check if user is admin
  const userIsAdmin = await isAdmin();
  
  if (!userIsAdmin) {
    redirect('/dashboard');
  }

  // Fetch all challenges with relations
  const challenges = await db.challenge.findMany({
    include: {
      category: true,
      files: true,
      questions: true,
      instances: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: [
      { categoryId: 'asc' },
      { id: 'asc' },
    ],
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin: Challenge Data Viewer</h1>
      <p className="text-gray-600 mb-4">
        Viewing {challenges.length} challenge(s) with all related data
      </p>
      <JsonViewer data={challenges} />
    </div>
  );
}
