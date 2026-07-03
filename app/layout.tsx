import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sora — Soroban Workbench',
  description: 'Postman-style workbench for Soroban smart contracts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.className}`}>
      <body className="h-full flex flex-col bg-[#0d1117] text-[#e6edf3]">
        {children}
      </body>
    </html>
  );
}
