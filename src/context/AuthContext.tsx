'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { loginWithJWT, logout as jwtLogout, getCurrentUser, isAuthenticated } from '@/lib/authService';

// Type étendu pour inclure à la fois l'authentification Supabase et JWT
type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
  // Nouvelle méthode pour l'authentification JWT
  signInWithJWT: (email: string, password: string) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setData = async () => {
      // Vérifier d'abord l'authentification JWT
      if (typeof window !== 'undefined' && isAuthenticated()) {
        const jwtUser = getCurrentUser();
        if (jwtUser) {
          // Créer un user "compatible" avec l'API Supabase
          const compatUser = {
            id: jwtUser.id,
            email: jwtUser.email || '',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '',
          } as User;
          
          setUser(compatUser);
          setLoading(false);
          return;
        }
      }

      // Si pas d'auth JWT, essayer Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    setData();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Méthode de connexion avec Supabase
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  // Nouvelle méthode de connexion avec JWT
  const signInWithJWT = async (email: string, password: string) => {
    const response = await loginWithJWT(email, password);
    
    if (response.token && !response.error) {
      // Créer un utilisateur compatible si la connexion est réussie
      if (response.user) {
        const compatUser = {
          id: response.user.id,
          email: response.user.email || '',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '',
        } as User;
        
        setUser(compatUser);
        // On ne définit pas de session ici car nous utilisons JWT
      }
      return { error: null };
    }
    
    return { error: response.error || 'Échec de connexion' };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { error, data };
  };

  const signOut = async () => {
    // Déconnexion des deux systèmes
    await supabase.auth.signOut();
    jwtLogout();
    
    // Reset l'état local
    setUser(null);
    setSession(null);
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signInWithJWT,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}