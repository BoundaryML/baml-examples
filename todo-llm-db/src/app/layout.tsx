import type { Metadata } from 'next';
// import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'TODO-LLM',
  description:
    'A simple todo list app that uses LLMs to help you get things done.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          `antialiased flex min-h-svh flex-col light`,
          'bg-background text-foreground',
        )}
      >
        {children}
      </body>
    </html>
  );
}
