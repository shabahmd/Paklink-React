import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Mock session type
export interface MockSession {
  user: { email: string };
}

export interface UserSession {
  email: string;
}

interface AuthContextProps {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setNewPassword: (email: string, newPassword: string) => Promise<void>;
  skipLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for user in AsyncStorage
    const checkUser = async () => {
      try {
        setIsLoading(true);
        
        // Check for skipLogin flag
        const skipLoginFlag = await AsyncStorage.getItem('skipLogin');
        if (skipLoginFlag === 'true') {
          // Create a guest user
          setUser({ email: 'guest@example.com' });
          return;
        }
        
        // Check for stored user
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Retrieve stored users
      const storedUsers = await AsyncStorage.getItem('users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Find user with matching email and password
      const foundUser = users.find((u: any) => 
        u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // Store logged in user (without password)
      const userToStore = { email: foundUser.email };
      await AsyncStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore);
      
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Retrieve stored users
      const storedUsers = await AsyncStorage.getItem('users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        throw new Error('User already exists');
      }
      
      // Add new user
      const newUser = { email, password };
      users.push(newUser);
      
      // Save updated users list
      await AsyncStorage.setItem('users', JSON.stringify(users));
      
      // Store logged in user (without password)
      const userToStore = { email };
      await AsyncStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore);
      
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('skipLogin');
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    const stored = await AsyncStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.email === email) {
        // In a real app, you'd send an email. Here, just simulate success.
        setIsLoading(false);
        return;
      }
    }
    setIsLoading(false);
    throw new Error('No user found with that email.');
  };

  const setNewPassword = async (email: string, newPassword: string) => {
    setIsLoading(true);
    const stored = await AsyncStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.email === email) {
        await AsyncStorage.setItem('user', JSON.stringify({ email, password: newPassword }));
        setUser({ email });
        setIsLoading(false);
        return;
      }
    }
    setIsLoading(false);
    throw new Error('No user found with that email.');
  };

  const skipLogin = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.setItem('skipLogin', 'true');
      setUser({ email: 'guest@example.com' });
    } catch (error) {
      console.error('Skip login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        resetPassword,
        setNewPassword,
        skipLogin,
      }}
    >
      {children}
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