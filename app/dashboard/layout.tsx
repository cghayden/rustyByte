import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='md:flex w-full h-full'>
      <Sidebar />
      <section className='flex-1 bg-stone-800 overflow-y-auto'>
        {children}
      </section>
    </div>
  );
}
