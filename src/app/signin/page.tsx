'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithJWT } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Utiliser d'abord l'authentification JWT
      const jwtAuthResponse = await signInWithJWT(email, password);
      
      // Si l'authentification JWT échoue, utiliser Supabase comme fallback
      if (jwtAuthResponse.error) {
        console.log('JWT auth failed, trying with Supabase');
        const { error } = await signIn(email, password);
        
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
      }
      
      // Si tout s'est bien passé
      toast({
        title: "Login Successful",
        description: "You are now logged in",
      });
      router.push('/'); // Redirection vers la page d'accueil après connexion
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-purple-100 p-4 rounded-full mb-4">
            <Image src="/chess-knight.svg" alt="ChessApp Logo" width={50} height={50} />
          </div>
          <h1 className="text-2xl font-bold text-purple-800">Welcome Back</h1>
          <p className="text-gray-600 mt-1">Sign in to continue to ChessApp</p>
        </div>
        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <a href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-800">Forgot password?</a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
          </div>
          <Button 
            type="submit" 
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-200" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
          <div className="text-center mt-4">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="text-purple-600 hover:text-purple-800 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}