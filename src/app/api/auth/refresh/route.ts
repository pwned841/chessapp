// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { refreshUserToken } from '@/lib/jwtUtils';
import { rateLimit } from '@/lib/rateLimit';

/**
 * Endpoint pour rafraîchir un token JWT expiré
 * POST /api/auth/refresh
 */
export async function POST(request: NextRequest) {
    try {
        // Appliquer le rate limiting (avec une limite plus souple car c'est une opération légitime)
        const rateLimitResponse = await rateLimit(request, {
            maxRequests: 20, // 20 requêtes
            windowSizeInSeconds: 60, // par minute
            message: 'Trop de tentatives de rafraîchissement de token, veuillez réessayer plus tard.'
        });
        
        if (rateLimitResponse) {
            return rateLimitResponse;
        }
        
        // Récupérer le token de rafraîchissement
        let refreshToken: string | null = null;
        
        // Essayer d'abord de le récupérer depuis le corps de la requête
        try {
            const body = await request.json();
            refreshToken = body.refreshToken;
        } catch (e) {
            // Si le corps n'est pas un JSON valide ou n'a pas de refreshToken, utiliser le cookie
            refreshToken = request.cookies.get('refresh_token')?.value || null;
        }
        
        if (!refreshToken) {
            return NextResponse.json(
                { error: 'Token de rafraîchissement manquant' },
                { status: 400 }
            );
        }
        
        // Rafraîchir le token JWT
        const tokenData = refreshUserToken(refreshToken);
        
        if (!tokenData) {
            return NextResponse.json(
                { error: 'Token de rafraîchissement invalide ou expiré' },
                { status: 401 }
            );
        }
        
        // Configurer les cookies pour le stockage sécurisé du token
        const response = NextResponse.json({
            token: tokenData.token,
            expiresIn: tokenData.expiresIn,
            success: true
        });
        
        response.cookies.set({
            name: 'access_token',
            value: tokenData.token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: tokenData.expiresIn
        });
        
        response.cookies.set({
            name: 'refresh_token',
            value: tokenData.refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 // 7 jours en secondes
        });
        
        return response;
    } catch (error: any) {
        console.error('Error in token refresh:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}