'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'DESIGNER';
}

interface AuthState {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    status: 'loading'
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a user session cookie
        const response = await fetch('/api/auth/check-session');
        
        if (response.ok) {
          const data = await response.json();
          console.log('Session check response:', data);
          setAuthState({
            user: data.user,
            status: 'authenticated'
          });
        } else {
          console.log('Session check failed:', response.status);
          setAuthState({
            user: null,
            status: 'unauthenticated'
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({
          user: null,
          status: 'unauthenticated'
        });
      }
    };

    checkAuth();
  }, []);

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      setAuthState({
        user: null,
        status: 'unauthenticated'
      });
      router.push('/auth/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    ...authState,
    signOut
  };
}
