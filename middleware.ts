import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { rateLimit } from '@/lib/rateLimit';
import { extractTokenFromRequest, verifyToken } from '@/lib/jwtUtils';

export async function middleware(request: NextRequest) {
  console.log(`Middleware intercepted: ${request.nextUrl.pathname}`);
  
  // Only protect API routes (except specific public endpoints)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Allow access to public endpoints
    const publicApiPaths = [
      '/api/chess-locations',
      '/api/forgot-password',
      // API d'authentification JWT
      '/api/auth/token',
      '/api/auth/refresh',
      // En mode développement, on peut temporairement permettre certains endpoints de recherche
      // IMPORTANT: À retirer en production!
      // '/api/players/search',
    ];
    
    // Check if current path is a public endpoint
    for (const path of publicApiPaths) {
      if (request.nextUrl.pathname.startsWith(path)) {
        console.log(`Public API endpoint allowed: ${request.nextUrl.pathname}`);
        return NextResponse.next();
      }
    }

    // ------ ÉTAPE 1: Rate Limiting ------
    // Applique le rate limiting pour toutes les routes API
    // avec une limite plus stricte pour les requêtes non authentifiées
    let isAuthenticated = false;
    const token = extractTokenFromRequest(request);
    
    if (token) {
      const payload = verifyToken(token);
      isAuthenticated = !!payload;
    }
    
    // Limite différente selon l'authentification
    const rateLimitConfig = isAuthenticated 
      ? { maxRequests: 100, windowSizeInSeconds: 60 } // 100 requêtes par minute pour utilisateurs authentifiés
      : { maxRequests: 30, windowSizeInSeconds: 60 };  // 30 requêtes par minute pour les autres
    
    const rateLimitResponse = await rateLimit(request, rateLimitConfig);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // ------ ÉTAPE 2: Vérification de l'origine de la requête ------
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const apiKey = request.headers.get('x-chessapp-api-key');
    
    console.log(`API Security Check - Referer: ${referer || 'none'}, Origin: ${origin || 'none'}, Has API Key: ${!!apiKey}`);
    
    // Define valid domains
    const potentialDomains = [
      'localhost',
      '127.0.0.1',
      process.env.NEXT_PUBLIC_APP_URL,
      'chessapp-ksqc.vercel.app'
    ];
    const validDomains = potentialDomains.filter(Boolean) as string[];
    
    // Check if request has valid API key or comes from valid referer
    const hasValidApiKey = apiKey === process.env.API_SECRET_KEY;
    const hasValidReferer = referer && validDomains.some(domain => 
      domain && referer.includes(domain));
    const hasValidOrigin = origin && validDomains.some(domain => 
      domain && origin.includes(domain));

    console.log(`Security validation - Valid API Key: ${hasValidApiKey}, Valid Referer: ${hasValidReferer}, Valid Origin: ${hasValidOrigin}`);
    
    // Règles spéciales pour les requêtes navigateur vs API direct
    const isBrowserRequest = !!request.headers.get('user-agent')?.includes('Mozilla');
    const isDirectBrowserAccess = isBrowserRequest && (!referer || !referer.includes('/'));
    const isNonBrowserWithoutApiKey = !isBrowserRequest && !hasValidApiKey;
    
    // Si la requête n'est pas valide selon nos critères et PAS un utilisateur authentifié par JWT
    if (!isAuthenticated && 
        ((!hasValidReferer && !hasValidOrigin && !hasValidApiKey) || 
         isDirectBrowserAccess || 
         isNonBrowserWithoutApiKey)) {
      console.log(`Access denied to API endpoint: ${request.nextUrl.pathname}`);
      return NextResponse.json({ 
        error: 'Unauthorized: Invalid request origin' 
      }, { status: 403 });
    }
    
    // ------ ÉTAPE 3: Authentication ------
    // Essayer d'abord l'authentification JWT
    if (isAuthenticated) {
      console.log('User authenticated via JWT token');
      // Si authentifié par JWT, on peut procéder
      return NextResponse.next();
    }
    
    // Si pas authentifié par JWT, essayer l'authentification Supabase comme fallback
    try {
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
        console.log('Authentication required but no valid session found');
        return NextResponse.json(
          { error: 'Unauthorized: Authentication required' },
          { status: 401 }
        );
      }
      
      console.log(`User authenticated via Supabase: ${session.user.email}`);
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
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