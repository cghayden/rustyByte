import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import TopNav from '@/components/TopNav';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Rusty Byte',
  description:
    'Where the buffers overfloweth with tales of hackery and hijinks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={`${inter.className} h-screen`}>
        <AuthProvider>
          <TopNav />
          <main className='h-[calc(100vh-4rem)] w-full overflow-y-auto'>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
