import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className='min-h-screen flex flex-col pt-16 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <h1 className='text-center text-3xl font-extrabold'>
          The Rusty Byte
        </h1>
        
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <RegisterForm />
      </div>
    </div>
  );
}
