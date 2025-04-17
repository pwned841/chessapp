'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Pages that don't require authentication
  const publicPages = ['/', '/signin', '/signup'];

  useEffect(() => {
    if (!loading && !user) {
      // If the user is not logged in and the current page is not public
      if (!publicPages.includes(pathname)) {
        router.push('/signin');
      }
    }
  }, [user, loading, router, pathname]);

  // Show loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Allow access to public pages without login, or to any page if user is logged in
  if (publicPages.includes(pathname) || user) {
    return <>{children}</>;
  }

  // Don't render anything during redirection
  return null;
}