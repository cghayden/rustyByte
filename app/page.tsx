import Image from 'next/image';

export default async function HomePage() {
  return (
    <div className=' flex min-h-screen p-6 justify-center'>
      <div className='max-w-xl flex flex-col items-center'>
        <Image
          src='/rustyByteLogoFull.png'
          alt='The Rusty Byte Logo'
          width={200}
          height={200}
          className='mb-6 object-contain'
          priority
          unoptimized
        />

        <div className='flex flex-col gap-2 items-center'>
          <h1 className='text-2xl font-bold'>Welcome to The Rusty Byte</h1>
          <p className=' '>
            Where the buffers overfloweth with tales of digital hackery and
            hijinks!
          </p>
          <p className=' '>
            Choose your quest from the categories above, brave adventurer.
          </p>
          <p className=' '>
            May your flags be captured and your exploits legendary!
          </p>
        </div>
      </div>
    </div>
  );
}
