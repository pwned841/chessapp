import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Only protect API routes (except specific public endpoints)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Allow access to public endpoints
    const publicApiPaths = [
      '/api/chess-locations',
    ];
    
    // Check if current path is a public endpoint
    for (const path of publicApiPaths) {
      if (request.nextUrl.pathname.startsWith(path)) {
        return NextResponse.next();
      }
    }
    
    // Get cookies from the request
    const requestHeaders = new Headers(request.headers);
    const responseCookies = requestHeaders.get('cookie') || '';
    
    // Create a Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const match = responseCookies.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
            return match ? decodeURIComponent(match[2]) : undefined;
          },
        },
      }
    );
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session exists, user is not authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }
  }
  
  // Allow the request to continue
  return NextResponse.next();
}

// Configure the middleware to run only for API routes
export const config = {
  matcher: '/api/:path*',
};