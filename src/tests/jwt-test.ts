// Script pour tester l'authentification JWT
// Lancez ce script avec: npx ts-node -O '{"module":"commonjs"}' src/tests/jwt-test.ts

import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'wariz1359@gmail.com';  // Remplacez par un email valide
const TEST_PASSWORD = 'password';    // Remplacez par le mot de passe correspondant

// Fonction pour tester l'authentification JWT
async function testJwtAuth() {
  console.log('🧪 Début des tests d\'authentification JWT');
  
  // 1. Test de connexion pour obtenir un token
  console.log('\n1. Test de connexion avec JWT');
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Connexion réussie');
      console.log('Token reçu:', loginData.token?.substring(0, 20) + '...');
      console.log('Expire dans:', loginData.expiresIn, 'secondes');
      
      // Extraire les cookies pour les utiliser dans les requêtes suivantes
      const cookies = loginResponse.headers.get('set-cookie');
      console.log('Cookies reçus:', cookies ? '✅' : '❌');
      
      // 2. Test d'accès à une API protégée
      console.log('\n2. Test d\'accès à une API protégée (recherche de joueurs)');
      const apiResponse = await fetch(`${API_BASE_URL}/players/search?q=carlsen`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Cookie': cookies || ''
        }
      });
      
      const apiData = await apiResponse.json();
      console.log('Statut de la réponse:', apiResponse.status);
      console.log('Authentifié selon l\'API:', apiData.authenticated ? '✅' : '❌');
      console.log('Nombre de joueurs trouvés:', apiData.players?.length || 0);
      
      // 3. Test de rafraîchissement du token
      console.log('\n3. Test de rafraîchissement du token');
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies || ''
        }
      });
      
      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok) {
        console.log('✅ Rafraîchissement du token réussi');
        console.log('Nouveau token reçu:', refreshData.token?.substring(0, 20) + '...');
      } else {
        console.log('❌ Échec du rafraîchissement:', refreshData.error);
      }
      
      // 4. Test de déconnexion
      console.log('\n4. Test de déconnexion');
      const logoutResponse = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Cookie': cookies || ''
        }
      });
      
      const logoutData = await logoutResponse.json();
      if (logoutResponse.ok) {
        console.log('✅ Déconnexion réussie:', logoutData.message);
      } else {
        console.log('❌ Échec de la déconnexion:', logoutData.error);
      }
      
    } else {
      console.log('❌ Échec de la connexion:', loginData.error);
    }
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// 5. Test de rate limiting
async function testRateLimiting() {
  console.log('\n5. Test du rate limiting');
  console.log('Envoi de multiples requêtes pour déclencher le rate limiting...');
  
  const MAX_REQUESTS = 35; // Dépassement de la limite de 30 pour les utilisateurs non authentifiés
  const results = { success: 0, limited: 0, errors: 0 };
  
  for (let i = 0; i < MAX_REQUESTS; i++) {
    try {
      const response = await fetch(`${API_BASE_URL}/players/search?q=test${i}`);
      const data = await response.json();
      
      if (response.status === 429) {
        results.limited++;
        console.log(`Requête ${i+1}: Rate limit atteint ✅`);
        // Afficher les headers de rate limiting
        console.log(' - X-RateLimit-Limit:', response.headers.get('X-RateLimit-Limit'));
        console.log(' - X-RateLimit-Remaining:', response.headers.get('X-RateLimit-Remaining'));
        console.log(' - X-RateLimit-Reset:', response.headers.get('X-RateLimit-Reset'), 'secondes');
        console.log(' - Retry-After:', response.headers.get('Retry-After'), 'secondes');
        break;
      } else {
        results.success++;
      }
      
      // Petite pause pour éviter de surcharger le serveur
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      results.errors++;
      console.error('Erreur lors du test de rate limiting:', error);
    }
  }
  
  console.log('\nRésultats du test de rate limiting:');
  console.log('- Requêtes réussies:', results.success);
  console.log('- Requêtes limitées:', results.limited);
  console.log('- Erreurs:', results.errors);
  
  if (results.limited > 0) {
    console.log('✅ Le rate limiting fonctionne correctement');
  } else {
    console.log('❌ Le rate limiting ne semble pas fonctionner correctement');
  }
}

// Exécuter les tests
async function runTests() {
  console.log('====== TESTS DU SYSTÈME JWT ET RATE LIMITING ======\n');
  
  await testJwtAuth();
  await testRateLimiting();
  
  console.log('\n====== TESTS TERMINÉS ======');
}

runTests().catch(console.error);