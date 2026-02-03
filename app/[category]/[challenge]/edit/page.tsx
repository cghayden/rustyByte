import { notFound, redirect } from 'next/navigation';
import { getChallenge, getCategoryById } from '@/lib/db';
import FileUpload from '@/components/FileUpload';
import { canCreateChallenges } from '@/lib/auth';
import { updateChallenge } from './actions';
import MultipleQuestionsInput from '@/components/MultipleQuestionsInput';

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
    <div className='bg-stone-800 text-gray-300 py-8 px-4 pb-20'>
      <div className='max-w-3xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold'>
            Edit Challenge: {challengeData.title}
          </h1>
          <p className='text-gray-400 mt-2'>
            Update challenge details, questions, and files
          </p>
        </div>

        <form action={updateChallenge} className='space-y-8'>
          <input type='hidden' name='challengeId' value={challengeData.id} />
          <input type='hidden' name='categoryId' value={categoryData.id} />

          {/* Challenge Details */}
          <div className='bg-yellow-100 shadow-md rounded-lg p-6 space-y-6'>
            <h2 className='text-xl font-semibold text-gray-900'>Challenge Details</h2>
            
            {/* Title */}
            <div>
              <label
                htmlFor='title'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Challenge Title
              </label>
              <input
                type='text'
                id='title'
                name='title'
                defaultValue={challengeData.title}
                required
                className='w-full px-3 py-2 border border-stone-800 bg-amber-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-stone-800'
              />
            </div>

            {/* Prompt */}
            <div>
              <label
                htmlFor='prompt'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Challenge Prompt
              </label>
              <textarea
                id='prompt'
                name='prompt'
                defaultValue={challengeData.prompt}
                required
                rows={6}
                className='w-full px-3 py-2 border border-stone-800 bg-amber-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-stone-800'
              />
            </div>
          </div>

          {/* Questions */}
          <div className='bg-yellow-100 shadow-md rounded-lg p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>Questions & Answers</h2>
            <MultipleQuestionsInput 
              initialQuestions={challengeData.questions.map(q => ({
                id: q.id.toString(),
                questionId: q.questionId,
                text: q.challengeQuestion,
                answers: q.answers,
              }))}
            />
          </div>

          {/* Submit */}
          <div className='flex gap-4'>
            <button
              type='submit'
              className='flex-1 bg-stone-600 text-white px-6 py-3 rounded-md font-medium hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-colors'
            >
              Save Changes
            </button>
            <a
              href={`/${category}/${challenge}`}
              className='px-6 py-3 border border-stone-800 rounded-md font-medium bg-stone-200 text-gray-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-colors text-center'
            >
              Cancel
            </a>
          </div>
        </form>

        {/* Files Section */}
        <div className='bg-yellow-100 shadow-md rounded-lg p-6 mt-8'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>Challenge Files</h2>
          <p className='text-gray-600 mb-4'>Upload files for participants to download</p>
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
      </div>
    </div>
  );
}
