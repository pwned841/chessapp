// app/api/players/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { rateLimit } from '@/lib/rateLimit';
import { extractTokenFromRequest, verifyToken } from '@/lib/jwtUtils';

// Instance unique de Prisma pour éviter trop de connexions
const prisma = new PrismaClient({
    log: ['error'],
});

// Utilisation de NextRequest au lieu de Request standard
export async function GET(request: NextRequest) {
    try {
        // 1. Application du rate limiting
        const rateLimitResponse = await rateLimit(request, {
            maxRequests: 20,  // 20 requêtes 
            windowSizeInSeconds: 60, // par minute
            message: 'Trop de requêtes de recherche. Veuillez réessayer dans quelques instants.'
        });
        
        // Si le rate limit est dépassé, renvoyer la réponse d'erreur
        if (rateLimitResponse) {
            return rateLimitResponse;
        }
        
        // 2. Vérification de l'authentification via token JWT
        // Le reste du code ne s'exécute que si l'utilisateur est authentifié
        let isAuthenticated = false;
        const token = extractTokenFromRequest(request);
        
        if (token) {
            const payload = verifyToken(token);
            isAuthenticated = !!payload;
        }
        
        // 3. Récupération des headers de façon native via NextRequest
        const referer = request.headers.get('referer') || '';
        const origin = request.headers.get('origin') || '';
        const apiKey = request.headers.get('x-chessapp-api-key') || '';
        const userAgent = request.headers.get('user-agent') || '';

        // Protection contre les accès directs
        const validDomains = [
            'localhost',
            '127.0.0.1',
            'chessapp-ksqc.vercel.app',
            process.env.NEXT_PUBLIC_APP_URL
        ].filter(Boolean);
        
        const hasValidApiKey = apiKey === process.env.API_SECRET_KEY;
        const hasValidReferer = referer && validDomains.some(domain => 
            domain && referer.includes(domain));
        const hasValidOrigin = origin && validDomains.some(domain => 
            domain && origin.includes(domain));

        // En environnement de production, être moins restrictif
        const isProduction = process.env.NODE_ENV === 'production';
        const isBrowserRequest = userAgent.includes('Mozilla');
        const isDirectBrowserAccess = isBrowserRequest && (!referer || !referer.includes('/'));
        const isNonBrowserWithoutApiKey = !isBrowserRequest && !hasValidApiKey;

        // Si la requête provient d'un utilisateur authentifié avec JWT, autoriser l'accès
        // Sinon, appliquer les vérifications d'origine/referer
        if (!isAuthenticated) {
            // Bloquer les accès directs non autorisés, mais avec des règles adaptées à la production
            if ((!hasValidReferer && !hasValidOrigin && !hasValidApiKey) || 
                (!isProduction && isDirectBrowserAccess) || 
                isNonBrowserWithoutApiKey) {
                console.log('Access denied to API players/search');
                return NextResponse.json({ 
                    error: 'Unauthorized: Invalid request origin' 
                }, { status: 403 });
            }
        }

        // Continuer avec le traitement normal de la requête
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q') || searchParams.get('query') || '';
        const type = searchParams.get('type') || 'standard'; // standard, rapid, blitz
        
        if (!query || query.length < 3) {
            return NextResponse.json({ 
                players: [],
                message: "Please provide at least 3 characters to search"
            }, { status: 200 });
        }

        console.log(`Searching for: ${query}`);
        
        // Search for players by name
        const players = await prisma.player.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive' // Case-insensitive search
                }
            },
            select: {
                fideid: true,
                name: true,
                country: true,
                title: true,
                rating: true,
                rapid_rating: true,
                blitz_rating: true,
                games: true,
                rapid_games: true,
                blitz_games: true,
                k: true,
                rapid_k: true,
                blitz_k: true,
                flag: true
            },
            orderBy: type === 'rapid' 
                ? { rapid_rating: 'desc' } 
                : type === 'blitz' 
                    ? { blitz_rating: 'desc' }
                    : { rating: 'desc' },
            take: isAuthenticated ? 20 : 10 // Plus de résultats pour les utilisateurs authentifiés
        });
        
        console.log('Results found:');
        if (players.length > 0) {
            players.forEach(player => console.log(`- ${player.name}`));
        } else {
            console.log('No players found');
        }

        // Configurer les headers pour les limites de débit
        const headers = new Headers();
        headers.set('X-RateLimit-Limit', request.headers.get('X-RateLimit-Limit') || '');
        headers.set('X-RateLimit-Remaining', request.headers.get('X-RateLimit-Remaining') || '');
        headers.set('X-RateLimit-Reset', request.headers.get('X-RateLimit-Reset') || '');

        return NextResponse.json({ 
            players,
            type,
            authenticated: isAuthenticated  // Indiquer au client s'il est authentifié
        }, { headers });

    } catch (error: any) {
        console.error('Error searching players:', error);
        return NextResponse.json({ 
            error: 'Failed to search players',
            message: error.message 
        }, { status: 500 });
    }
}