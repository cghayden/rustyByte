import { getCategories } from '@/lib/db';
import { createChallenge } from './actions';
import MultipleQuestionsInput from '@/components/MultipleQuestionsInput';
import FileRequirements from '@/components/FileRequirements';
import { canCreateChallenges } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function CreateChallengePage() {
  // Check if user has permission to create challenges
  const hasPermission = await canCreateChallenges();
  if (!hasPermission) {
    redirect('/');
  }

  const categories = await getCategories();

  return (
    <div className='bg-stone-800 text-gray-300 py-8 px-4 pb-20'>
      <div className='max-w-3xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8'>Create A New Challenge</h1>

        <form
          action={createChallenge}
          className='bg-yellow-100 shadow-md rounded-lg p-6 space-y-6'
        >
          {/* Category Selection */}
          <div>
            <label
              htmlFor='category'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Category
            </label>
            <select
              id='category'
              name='categoryId'
              required
              className='w-full px-3 py-2 border border-stone-800 bg-amber-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-stone-800'
            >
              <option value=''>Select a category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Challenge Title */}
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
              required
              className='w-full px-3 py-2 border border-stone-800 bg-amber-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-stone-800'
            />
          </div>

          {/* File Requirements Section */}
          <FileRequirements>
            {/* Challenge Prompt */}
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
                required
                rows={6}
                className='w-full px-3 py-2 border border-stone-800 bg-amber-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-stone-800'
              />
            </div>
          </FileRequirements>

          {/* Multiple Questions */}
          <MultipleQuestionsInput />

          {/* Submit Button */}
          <div className='flex gap-4 pt-4'>
            <button
              type='submit'
              className='flex-1 bg-stone-600 text-white px-6 py-3 rounded-md font-medium hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-colors'
            >
              Create Challenge
            </button>
            <button
              type='reset'
              className='px-6 py-3 border border-stone-800 rounded-md font-medium bg-stone-200 text-gray-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-colors'
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
