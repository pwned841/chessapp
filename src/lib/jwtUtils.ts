// src/lib/jwtUtils.ts
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// Configuration des tokens
const JWT_SECRET = process.env.JWT_SECRET || 'chess-app-jwt-secret-key-change-in-production';
const TOKEN_EXPIRY = process.env.JWT_TOKEN_EXPIRY || '1h'; // 1 heure par défaut
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d'; // 7 jours par défaut

// Types pour les tokens
interface TokenPayload {
  userId: string;
  email?: string;
  role?: string;
  // Autres données à inclure dans le token
  [key: string]: any;
}

interface TokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number; // Expiration en secondes
}

/**
 * Génère un token JWT pour l'utilisateur
 */
export function generateToken(payload: TokenPayload): TokenResponse {
  // Calcul des timestamps d'expiration
  const expiresInSeconds = getExpirySeconds(TOKEN_EXPIRY);
  const refreshExpiresInSeconds = getExpirySeconds(REFRESH_TOKEN_EXPIRY);
  
  // Génération du token principal
  const token = jwt.sign(
    {
      ...payload,
      type: 'access'
    },
    JWT_SECRET,
    { expiresIn: expiresInSeconds } // Use expiration in seconds
  );
  
  // Génération du token de rafraîchissement
  const refreshToken = jwt.sign(
    {
      userId: payload.userId,
      type: 'refresh'
    },
    JWT_SECRET,
    { expiresIn: refreshExpiresInSeconds } // Use expiration in seconds
  );
  
  return {
    token,
    refreshToken,
    expiresIn: expiresInSeconds
  };
}

/**
 * Vérifie et décode un token JWT
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload & { type: string };
    
    // Vérifier que c'est un token d'accès
    if (decoded.type !== 'access') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Renouvelle un token d'accès à partir d'un token de rafraîchissement
 */
export function refreshUserToken(refreshToken: string): TokenResponse | null {
  try {
    // Vérifier le token de rafraîchissement
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string; type: string };
    
    // Vérifier que c'est un token de rafraîchissement
    if (decoded.type !== 'refresh') {
      return null;
    }
    
    // Générer un nouveau token d'accès
    return generateToken({ userId: decoded.userId });
  } catch (error) {
    console.error('JWT refresh error:', error);
    return null;
  }
}

/**
 * Extrait le token JWT de la requête (depuis Authorization header ou cookie)
 */
export function extractTokenFromRequest(req: NextRequest): string | null {
  // Vérifier le header Authorization (format: "Bearer TOKEN")
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Vérifier les cookies
  const cookies = req.cookies;
  const tokenFromCookie = cookies.get('access_token');
  if (tokenFromCookie) {
    return tokenFromCookie.value;
  }
  
  return null;
}

/**
 * Convertit une durée (1h, 7d, etc.) en secondes
 */
function getExpirySeconds(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 3600; // 1 heure par défaut
  }
  
  const [, value, unit] = match;
  const numValue = parseInt(value, 10);
  
  switch (unit) {
    case 's': return numValue;
    case 'm': return numValue * 60;
    case 'h': return numValue * 3600;
    case 'd': return numValue * 86400;
    default: return 3600;
  }
}