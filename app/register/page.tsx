import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <h1 className='text-center text-3xl font-extrabold text-gray-900'>
          The Rusty Byte Tavern
        </h1>
        <p className='mt-2 text-center text-sm text-gray-600'>
          Create an account to get started
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <RegisterForm />
      </div>
    </div>
  );
}
