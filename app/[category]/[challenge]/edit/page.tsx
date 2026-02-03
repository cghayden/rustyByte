import { notFound, redirect } from 'next/navigation';
import { getChallenge, getCategoryById } from '@/lib/db';
import FileUpload from '@/components/FileUpload';
import { canCreateChallenges, getCurrentUser } from '@/lib/auth';
import { updateChallenge } from './actions';
import MultipleQuestionsInput from '@/components/MultipleQuestionsInput';
import DeleteChallengeButton from '@/components/DeleteChallengeButton';
import SubmitButton from '@/components/SubmitButton';
import db from '@/lib/db';

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

  // Check if user can delete this challenge (author or admin)
  const currentUser = await getCurrentUser();
  let canDelete = false;
  if (currentUser) {
    const userRecord = await db.user.findUnique({
      where: { id: currentUser.userId },
      select: { role: true },
    });
    const isAdmin = userRecord?.role === 'ADMIN';
    const isAuthor = challengeData.authorId === currentUser.userId;
    canDelete = isAdmin || isAuthor;
  }

  return (
    <div className='bg-stone-800 text-gray-300 py-4 px-3 pb-16'>
      <div className='max-w-2xl mx-auto'>
        <div className='mb-4 flex items-start justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>
              Edit Challenge: {challengeData.title}
            </h1>
            <p className='text-gray-400 mt-1 text-sm'>
              Update challenge details, questions, and files
            </p>
          </div>
          <DeleteChallengeButton
            challengeId={challengeData.id}
            challengeTitle={challengeData.title}
            canDelete={canDelete}
          />
        </div>

        <form action={updateChallenge} className='space-y-4'>
          <input type='hidden' name='challengeId' value={challengeData.id} />
          <input type='hidden' name='categoryId' value={categoryData.id} />

          {/* Challenge Details */}
          <div className='bg-yellow-100 shadow-md rounded-lg p-2 space-y-4'>
          
            
            {/* Title */}
            <div>
              <label
                htmlFor='title'
                className='block font-medium text-gray-700 mb-1'
              >
                Challenge Title
              </label>
              <input
                type='text'
                id='title'
                name='title'
                defaultValue={challengeData.title}
                required
                className='w-full px-2 py-1 border border-stone-800 bg-amber-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-stone-800 text-sm'
              />
            </div>

            {/* Prompt */}
            <div>
              <label
                htmlFor='prompt'
                className='block font-medium text-gray-700 mb-1'
              >
                Challenge Prompt
              </label>
              <textarea
                id='prompt'
                name='prompt'
                defaultValue={challengeData.prompt}
                required
                rows={4}
                className='w-full px-2 py-1.5 border border-stone-800 bg-amber-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-stone-800 text-sm'
              />
            </div>

        
            
            <MultipleQuestionsInput 
              initialQuestions={challengeData.questions.map(q => ({
                id: q.id.toString(),
                questionId: q.questionId,
                text: q.challengeQuestion,
                answers: q.answers,
              }))}
              />
              </div>
 {/* Files Section */}
        <div className='bg-yellow-100 shadow-md rounded-lg p-1 mt-4'>
          <h2 className='text-lg font-semibold text-gray-900 mb-1'>Challenge Files</h2>
          <p className='text-gray-600 mb-3 text-sm'>Upload files for participants to download;  50 MB max</p>
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
        </div>
          {/* Submit */}
          <div className='flex gap-3'>
            <SubmitButton
              className='flex-1 bg-stone-600 text-white px-4 py-2 rounded-md font-medium hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-colors text-sm'
              pendingText='Saving...'
            >
              Save Changes
            </SubmitButton>
            <a
              href={`/${category}/${challenge}`}
              className='px-4 py-2 border border-stone-800 rounded-md font-medium bg-stone-200 text-gray-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-colors text-center text-sm'
            >
              Cancel
            </a>
          </div>
        </form>

       
      </div>
    </div>
  );
}
