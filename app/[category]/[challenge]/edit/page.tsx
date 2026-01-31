import { notFound, redirect } from 'next/navigation';
import { getChallenge, getCategoryById } from '@/lib/db';
import FileUpload from '@/components/FileUpload';
import { canCreateChallenges } from '@/lib/auth';

export default async function EditChallengePage({
  params,
}: {
  params: Promise<{ category: string; challenge: string }>;
}) {
  // Check if user has permission to edit challenges
  const hasPermission = await canCreateChallenges();
  if (!hasPermission) {
    redirect('/');
  }

  const { category, challenge } = await params;
  const [categoryData, challengeData] = await Promise.all([
    getCategoryById(category),
    getChallenge(category, challenge),
  ]);

  if (!categoryData || !challengeData) return notFound();

  return (
    <div className='bg-gray-50 py-8 px-4 pb-20'>
      <div className='max-w-3xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Manage Files: {challengeData.title}
          </h1>
          <p className='text-gray-600 mt-2'>
            Upload files for participants to download
          </p>
        </div>

        <div className='bg-white shadow-md rounded-lg p-6'>
          <FileUpload
            challengeId={challengeData.id.toString()}
            existingFiles={
              challengeData.files?.map((file) => ({
                id: file.id,
                name: file.name,
                filename: file.filename,
                size: file.fileSize || 0,
              })) || []
            }
          />

          <div className='mt-6 pt-6 border-t border-gray-200'>
            <a
              href={`/${category}/${challenge}`}
              className='inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors'
            >
              ← Back to Challenge
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
