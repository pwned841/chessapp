/**
 * Utility functions for making API calls with proper authentication headers
 */

import { getAuthToken } from './authService';

// Suppression de la référence directe à la clé d'API publique
// const API_KEY = process.env.NEXT_PUBLIC_API_CLIENT_KEY || 'chessapp-client-key';

/**
 * Makes a fetch request to the API with the necessary headers
 */
export async function fetchApi(
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> {
  // Ensure we're working with a proper endpoint
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Set up the headers with our API key
  const headers = new Headers(options.headers || {});
  
  // Ne plus ajouter de clé API dans les requêtes client
  // Nous nous appuyons maintenant uniquement sur la validation d'origine et les tokens JWT
  
  // Add JWT authentication token if available
  const token = await getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Merge our headers with any existing options
  const apiOptions = {
    ...options,
    headers,
    credentials: 'include' as RequestCredentials, // Pour envoyer les cookies (utile pour refresh token)
  };
  
  // Make the API call
  return fetch(url, apiOptions);
}

/**
 * GET request helper
 */
export async function apiGet(endpoint: string, options: RequestInit = {}): Promise<any> {
  const response = await fetchApi(endpoint, {
    ...options,
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * POST request helper
 */
export async function apiPost(endpoint: string, data: any, options: RequestInit = {}): Promise<any> {
  const response = await fetchApi(endpoint, {
    ...options,
    method: 'POST',
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
}