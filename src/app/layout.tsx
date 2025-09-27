import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AdvancedProtection from './components/AdvancedProtection';
import SourceCodeProtection from './components/SourceCodeProtection';
import Navbar from './components/Navbar';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QR Code App',
  description: 'Protected QR Code Generator with video scanning capabilities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive" />
      </head>
      <body className={inter.className}>
        <AdvancedProtection />
        <SourceCodeProtection />
        <Navbar />
        {children}
      </body>
    </html>
  );
}