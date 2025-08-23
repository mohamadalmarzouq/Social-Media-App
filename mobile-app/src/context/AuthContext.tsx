import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../lib/api';
import { getToken, setToken, clearToken } from '../lib/token';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'DESIGNER';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    try {
      const token = await getToken();
      if (token) {
        // Verify token is still valid by calling /me endpoint
        try {
          const userData = await apiFetch('/api/mobile/me');
          if (userData.user) {
            setUser(userData.user);
          } else {
            // Token invalid, clear it
            await clearToken();
            setUser(null);
          }
        } catch (error) {
          // Token invalid, clear it
          await clearToken();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting sign in with:', { email, password: '***' });
      
      // Call the mobile login endpoint
      const data = await apiFetch('/api/mobile/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Sign in response:', data);

      if (data.token && data.user) {
        await setToken(data.token);
        setUser(data.user);
        console.log('Sign in successful, token and user set:', { token: data.token, user: data.user });
        return true;
      } else {
        console.error('Sign in failed:', data.error || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error; // Re-throw to let the UI handle it
    }
  };

  const signUp = async (name: string, email: string, password: string, role: string): Promise<boolean> => {
    try {
      console.log('Attempting sign up with:', { name, email, role, password: '***' });
      
      // For now, redirect to sign in since we don't have a mobile signup endpoint
      // You can implement this later if needed
      console.log('Sign up not implemented for mobile yet');
      return false;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error; // Re-throw to let the UI handle it
    }
  };

  const signOut = async () => {
    try {
      await clearToken();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };



  useEffect(() => {
    checkSession();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
