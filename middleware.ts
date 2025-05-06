import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

export async function middleware(request: NextRequest) {
  console.log(`Middleware intercepted: ${request.nextUrl.pathname}`);
  
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // ------ Rate Limiting ------
    // Simple rate limiting to prevent abuse
    const rateLimitConfig = { maxRequests: 50, windowSizeInSeconds: 60 };  // 50 requêtes par minute
    
    const rateLimitResponse = await rateLimit(request, rateLimitConfig);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }
  
  // Allow all requests to continue
  return NextResponse.next();
}

// Configure the middleware to run only for API routes
export const config = {
  matcher: '/api/:path*',
};