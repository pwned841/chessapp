// src/lib/rateLimit.ts
import { NextRequest, NextResponse } from 'next/server';

// Interface pour la configuration du rate limiting
interface RateLimitConfig {
  // Nombre maximum de requêtes autorisées dans l'intervalle
  maxRequests: number;
  // Durée de l'intervalle en secondes
  windowSizeInSeconds: number;
  // Message d'erreur en cas de dépassement de limite (optionnel)
  message?: string;
}

// Interface pour stocker les informations de rate limiting par IP/client
interface RateLimitInfo {
  count: number;
  lastReset: number;
}

// Stockage en mémoire pour le développement
// En production, utilisez Redis ou une autre solution distribuée
const ipRequestCounts = new Map<string, RateLimitInfo>();

/**
 * Middleware de rate limiting pour les routes API Next.js
 * Utilise l'adresse IP ou une clé API comme identifiant
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = { maxRequests: 100, windowSizeInSeconds: 60 }
): Promise<NextResponse | null> {
  // Récupérer l'identifiant du client (préférer une clé API ou un JWT token)
  // Utiliser x-forwarded-for pour l'IP, en prenant la première si plusieurs
  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : null;
  
  const clientId = request.headers.get('x-chessapp-api-key') || 
                   clientIp || 
                   'unknown';
  
  // Obtenir le timestamp actuel en secondes
  const now = Math.floor(Date.now() / 1000);
  
  // Obtenir ou initialiser les informations de rate limiting pour ce client
  let clientInfo = ipRequestCounts.get(clientId);
  if (!clientInfo) {
    clientInfo = { count: 0, lastReset: now };
    ipRequestCounts.set(clientId, clientInfo);
  }
  
  // Réinitialiser le compteur si l'intervalle est terminé
  if (now - clientInfo.lastReset > config.windowSizeInSeconds) {
    clientInfo.count = 0;
    clientInfo.lastReset = now;
  }
  
  // Incrémenter le compteur
  clientInfo.count += 1;
  
  // Vérifier si le client a dépassé la limite
  if (clientInfo.count > config.maxRequests) {
    const resetTime = clientInfo.lastReset + config.windowSizeInSeconds;
    const secondsToReset = resetTime - now;
    
    // Headers standard pour le rate limiting
    const headers = {
      'X-RateLimit-Limit': `${config.maxRequests}`,
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': `${secondsToReset}`,
      'Retry-After': `${secondsToReset}`
    };
    
    // Renvoyer une réponse 429 (Too Many Requests)
    return NextResponse.json(
      { 
        error: config.message || 'Rate limit exceeded', 
        retryAfter: secondsToReset 
      },
      { 
        status: 429, 
        headers 
      }
    );
  }
  
  // Si le client n'a pas dépassé la limite, ajouter les headers d'information
  // et renvoyer null pour indiquer que la requête peut continuer
  // Ces headers peuvent être ajoutés à la réponse finale
  request.headers.set('X-RateLimit-Limit', `${config.maxRequests}`);
  request.headers.set('X-RateLimit-Remaining', `${config.maxRequests - clientInfo.count}`);
  request.headers.set('X-RateLimit-Reset', `${clientInfo.lastReset + config.windowSizeInSeconds - now}`);
  
  return null;
}

// Fonction de nettoyage pour éviter les fuites mémoire
// À appeler périodiquement (par exemple avec un setTimeout)
export function cleanupRateLimitCache(): void {
  const now = Math.floor(Date.now() / 1000);
  
  for (const [clientId, info] of ipRequestCounts.entries()) {
    // Supprimer les entrées expirées (plus de 1 heure)
    if (now - info.lastReset > 3600) {
      ipRequestCounts.delete(clientId);
    }
  }
}

// Nettoyer le cache toutes les heures
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitCache, 3600 * 1000);
}