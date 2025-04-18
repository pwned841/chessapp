'use client';

import { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
}

// Ce composant ne s'affiche que côté client, évitant ainsi les problèmes de rendu SSR
export default function ClientOnly({ children }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <>{children}</> : null;
}