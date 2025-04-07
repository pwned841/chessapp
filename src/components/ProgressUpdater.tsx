'use client';

import React, { useState, useEffect } from 'react';

interface ProgressUpdaterProps {
  username: string;
  isLoading: boolean;
}

export default function ProgressUpdater({ username, isLoading }: ProgressUpdaterProps) {
  const [status, setStatus] = useState('Initialisation...');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!isLoading || !username) return;
    
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`/api/opening-tree/status?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        
        if (data.status) {
          setStatus(data.status);
        }
        if (data.progress) {
          setProgress(Math.min(95, data.progress));
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du statut:', error);
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [username, isLoading]);
  
  return (
    <div className="text-center py-6">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
      <p className="text-lg font-medium text-gray-700 mb-2">{status}</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500">
        La construction de l'arbre d'ouvertures peut prendre quelques minutes selon le nombre de parties
      </p>
    </div>
  );
}
