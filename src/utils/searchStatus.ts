/**
 * Utilitaire pour mettre à jour le statut de recherche
 */

/**
 * Met à jour le statut d'une recherche via une requête API
 */
export async function updateSearchStatus(username: string, status: string, progress: number): Promise<void> {
  try {
    const response = await fetch('/api/opening-tree/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        status,
        progress
      }),
    });

    if (!response.ok) {
      console.error('Failed to update search status:', await response.text());
    }
  } catch (error) {
    console.error('Error updating search status:', error);
  }
}

/**
 * Récupère le statut d'une recherche via une requête API
 */
export async function getSearchStatus(username: string) {
  try {
    const response = await fetch(`/api/opening-tree/status?username=${encodeURIComponent(username)}`);
    if (!response.ok) {
      throw new Error(`Failed to get search status: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting search status:', error);
    return {
      status: 'error',
      progress: 0,
      lastUpdate: Date.now()
    };
  }
}
