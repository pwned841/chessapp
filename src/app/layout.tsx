import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from '@/context/AuthContext';
import RequireAuth from '@/components/RequireAuth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChessApp - Know Your Opponent',
  description: 'Discover everything about your chess opponents across FIDE, Chess.com, and Lichess',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100`}>
        <AuthProvider>
          <RequireAuth>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow pt-4">
                {children}
              </main>
              <Footer />
            </div>
          </RequireAuth>
          <Toaster />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}