import type { Metadata } from 'next';
import { Instrument_Sans, Syne } from 'next/font/google';
import './globals.css';
import { WordProvider } from '@/lib/context';
import { ToastProvider } from '@/lib/toast-context';

const instrumentSans = Instrument_Sans({
  variable: '--font-instrument-sans',
  subsets: ['latin'],
});

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'WordMind – Học Từ Vựng Tiếng Anh',
  description: 'Ứng dụng học từ vựng tiếng Anh với AI và flashcards',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${instrumentSans.variable} ${syne.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ minHeight: '100vh', overflowX: 'hidden' }}>
        <WordProvider>
          <ToastProvider>{children}</ToastProvider>
        </WordProvider>
      </body>
    </html>
  );
}
