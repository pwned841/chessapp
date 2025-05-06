// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint pour se déconnecter et invalider les tokens JWT
 * POST /api/auth/logout
 */
export async function POST(request: NextRequest) {
    try {
        // Créer une réponse qui efface les cookies
        const response = NextResponse.json({
            success: true,
            message: 'Déconnecté avec succès'
        });
        
        // Effacer les cookies de token
        response.cookies.set({
            name: 'access_token',
            value: '',
            httpOnly: true,
            expires: new Date(0), // Date dans le passé = expiration immédiate
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });
        
        response.cookies.set({
            name: 'refresh_token',
            value: '',
            httpOnly: true,
            expires: new Date(0),
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });
        
        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la déconnexion' },
            { status: 500 }
        );
    }
}