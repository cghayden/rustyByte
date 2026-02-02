import Image from 'next/image';
import Link from 'next/link';
import { getCategories } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  // Redirect logged-in users to dashboard
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token');
  
  if (authToken) {
    redirect('/dashboard');
  }

  const categories = await getCategories();

  return (
    <div className='flex min-h-screen p-6 justify-center'>
      <div className='max-w-4xl flex flex-col items-center w-full'>
        <Image
          src='/rustyByteLogoFull.png'
          alt='The Rusty Byte Logo'
          width={200}
          height={200}
          className='mb-6 object-contain'
          priority
          unoptimized
        />

        <div className='flex flex-col gap-6 items-center w-full'>
          <h1 className='text-2xl font-bold'>Welcome to The Rusty Byte</h1>
          <p className='text-center'>
            Where the buffers overfloweth with tales of digital hackery and
            hijinks!
          </p>
          <p className='text-center'>
            Choose your quest from the categories below, brave adventurer.
          </p>
          <p className='text-center'>
            May your flags be captured and your exploits legendary!
          </p>

          {/* Category Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-8'>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/${category.id}`}
                className='p-6 rounded-xl bg-tavern-light border border-accent/30 hover:bg-tavern-medium hover:border-accent transition-all group'
              >
                <h2 className='text-xl font-semibold text-accent group-hover:text-accent-light transition-colors'>
                  {category.name}
                </h2>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
