// src/app/api/auth/token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/jwtUtils';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';

/**
 * Endpoint pour obtenir un token JWT à partir des identifiants
 * POST /api/auth/token
 */
export async function POST(request: NextRequest) {
    try {
        // Appliquer le rate limiting pour éviter les attaques par force brute
        const rateLimitResponse = await rateLimit(request, {
            maxRequests: 10, // 10 requêtes
            windowSizeInSeconds: 60, // par minute
            message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.'
        });
        
        if (rateLimitResponse) {
            return rateLimitResponse;
        }
        
        // Récupérer les identifiants depuis le corps de la requête
        const { email, password } = await request.json();
        
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email et mot de passe requis' },
                { status: 400 }
            );
        }
        
        // Authentifier via Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }
        
        const user = data.user;
        
        // Générer un token JWT pour l'utilisateur
        const tokenData = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role || 'user'
        });
        
        // Configurer les cookies pour le stockage sécurisé du token
        // Le cookie httpOnly empêche l'accès via JavaScript côté client
        const response = NextResponse.json({
            token: tokenData.token,
            expiresIn: tokenData.expiresIn,
            user: {
                id: user.id,
                email: user.email
            }
        });
        
        response.cookies.set({
            name: 'access_token',
            value: tokenData.token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Sécurisé en production seulement
            sameSite: 'strict',
            maxAge: tokenData.expiresIn // Durée en secondes
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
        console.error('Error in token generation:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}