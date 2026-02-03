import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  // Redirect logged-in users to dashboard
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token');
  
  if (authToken) {
    redirect('/dashboard');
  }

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
            Login or register to begin your quest, brave adventurer.
          </p>
          <p className='text-center'>
            May your flags be captured and your exploits legendary!
          </p>

          {/* Login/Register CTAs */}
          <div className='flex gap-4 mt-8'>
            <Link
              href='/login'
              className='px-6 py-3 rounded-lg bg-accent text-black font-semibold hover:bg-accent-light transition-colors'
            >
              Login
            </Link>
            <Link
              href='/register'
              className='px-6 py-3 rounded-lg border border-accent text-accent font-semibold hover:bg-tavern-light transition-colors'
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
