// src/lib/authService.ts
/**
 * Service d'authentification pour gérer les tokens JWT
 */

import { apiGet, apiPost } from './apiUtils';

interface User {
  id: string;
  email: string;
  role?: string;
}

interface AuthResponse {
  token: string;
  refreshToken?: string;
  expiresIn: number;
  user?: User;
  success?: boolean;
  error?: string;
}

interface TokenData {
  token: string;
  expiresAt: number; // timestamp en millisecondes
  user?: User;
}

// Clés de stockage local
const TOKEN_KEY = 'chess_auth_token';
const TOKEN_EXPIRY_KEY = 'chess_auth_expiry';
const USER_DATA_KEY = 'chess_auth_user';

/**
 * Obtient un JWT en s'authentifiant avec email et mot de passe
 */
export const loginWithJWT = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        token: '', 
        expiresIn: 0, 
        error: data.error || 'Échec de connexion' 
      };
    }
    
    // Stocker le token et les informations utilisateur
    storeAuthData(data.token, data.expiresIn, data.user);
    
    return data;
  } catch (error) {
    console.error('Error during JWT login:', error);
    return {
      token: '',
      expiresIn: 0,
      error: 'Erreur de communication avec le serveur'
    };
  }
};

/**
 * Rafraîchit un token JWT expiré en utilisant le refresh token
 */
export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    // Le refreshToken est géré par les cookies httpOnly, 
    // donc pas besoin de l'envoyer explicitement
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        token: '', 
        expiresIn: 0, 
        error: data.error || 'Échec de rafraîchissement du token' 
      };
    }
    
    // Mettre à jour le token et sa date d'expiration
    storeAuthData(data.token, data.expiresIn);
    
    return data;
  } catch (error) {
    console.error('Error during token refresh:', error);
    return {
      token: '',
      expiresIn: 0,
      error: 'Erreur lors du rafraîchissement du token'
    };
  }
};

/**
 * Vérifie si l'utilisateur est authentifié et si le token est valide
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false; // Côté serveur
  }
  
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryStr) return false;
  
  const expiry = parseInt(expiryStr, 10);
  return Date.now() < expiry;
};

/**
 * Obtient le token JWT stocké, et le rafraîchit automatiquement s'il est proche de l'expiration
 */
export const getAuthToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    return null; // Côté serveur
  }
  
  const token = localStorage.getItem(TOKEN_KEY);
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!token || !expiryStr) {
    return null;
  }
  
  const expiry = parseInt(expiryStr, 10);
  const now = Date.now();
  
  // Si le token expire dans moins de 5 minutes, essayer de le rafraîchir
  if (expiry - now < 5 * 60 * 1000) {
    try {
      const { token: newToken, error } = await refreshToken();
      if (error) {
        return null; // Échec du rafraîchissement
      }
      return newToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }
  
  return token;
};

/**
 * Récupère les informations utilisateur stockées
 */
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null; // Côté serveur
  }
  
  const userStr = localStorage.getItem(USER_DATA_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
};

/**
 * Stocke les données d'authentification localement
 */
const storeAuthData = (token: string, expiresIn: number, user?: User): void => {
  if (typeof window === 'undefined') {
    return; // Côté serveur
  }
  
  // Convertir expiresIn (secondes) en timestamp d'expiration
  const expiresAt = Date.now() + expiresIn * 1000;
  
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
  
  if (user) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }
};

/**
 * Déconnexion: supprime toutes les données d'authentification stockées
 */
export const logout = (): void => {
  if (typeof window === 'undefined') {
    return; // Côté serveur
  }
  
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  
  // Optionnel: appel au serveur pour invalider la session
  fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include', // Pour inclure les cookies
  }).catch(e => console.error('Error during logout:', e));
};

/**
 * Ajoute le token JWT aux headers d'une requête API
 */
export const addAuthHeaders = async (headers: HeadersInit = {}): Promise<HeadersInit> => {
  const token = await getAuthToken();
  
  if (token) {
    return {
      ...headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  return headers;
};