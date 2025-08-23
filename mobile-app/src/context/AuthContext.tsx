import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, testBackendConnectivity } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'DESIGNER';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isOnline: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  testApiConnection: () => Promise<boolean>;
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
  const [isOnline, setIsOnline] = useState(true);

  // Track network status - React Native compatible version
  useEffect(() => {
    // For now, assume online by default in mobile app
    // We can add proper network detection later if needed
    setIsOnline(true);
    
    // Note: In a production app, you would use:
    // import NetInfo from '@react-native-async-storage/async-storage';
    // But for now, let's keep it simple to get the app working
  }, []);

  const checkSession = async () => {
    try {
      const sessionData = await AsyncStorage.getItem('user-session');
      if (sessionData) {
        const userData = JSON.parse(sessionData);
        setUser(userData);
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
      console.log('Network status:', isOnline ? 'Online' : 'Offline');
      
      // Check if we're online - React Native compatible version
      if (!isOnline) {
        console.error('Device appears to be offline');
        return false;
      }
      
      // Use the new authAPI helper
      const data = await authAPI.signIn(email, password);
      console.log('Sign in response:', data);

      if (data.success && data.user) {
        const userData = data.user;
        setUser(userData);
        await AsyncStorage.setItem('user-session', JSON.stringify(userData));
        console.log('Sign in successful, user set:', userData);
        return true;
      } else {
        console.error('Sign in failed:', data.message || 'Unknown error');
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
      
      // Use the new authAPI helper
      const data = await authAPI.signUp(name, email, password, role);
      console.log('Sign up response:', data);

      if (data.user) {
        const userData = data.user;
        setUser(userData);
        await AsyncStorage.setItem('user-session', JSON.stringify(userData));
        console.log('Sign up successful, user set:', userData);
        return true;
      } else {
        console.error('Sign up failed:', data.error || data.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error; // Re-throw to let the UI handle it
    }
  };

  const signOut = async () => {
    try {
      await authAPI.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setUser(null);
      await AsyncStorage.removeItem('user-session');
    }
  };

  const testApiConnection = async (): Promise<boolean> => {
    try {
      console.log('=== NETWORK DIAGNOSTICS START ===');
      console.log('Platform: React Native (Expo)');
      console.log('Current network status:', isOnline ? 'Online' : 'Offline');
      
      // Test basic connectivity first
      try {
        console.log('Testing basic internet connectivity...');
        const testResponse = await fetch('https://httpbin.org/get');
        console.log('Basic internet connectivity test:', testResponse.ok);
        console.log('Response status:', testResponse.status);
      } catch (error) {
        console.error('Basic internet connectivity test failed:', error);
      }
      
      // Test our backend connectivity
      try {
        console.log('Testing backend connectivity...');
        const backendOk = await testBackendConnectivity();
        console.log('Backend connectivity test result:', backendOk);
        console.log('=== NETWORK DIAGNOSTICS END ===');
        return backendOk;
      } catch (error) {
        console.error('Backend connectivity test failed:', error);
        console.log('=== NETWORK DIAGNOSTICS END ===');
        return false;
      }
      
    } catch (error) {
      console.error('API connection test failed:', error);
      console.log('=== NETWORK DIAGNOSTICS END ===');
      return false;
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isOnline,
    signIn,
    signUp,
    signOut,
    checkSession,
    testApiConnection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
