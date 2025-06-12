import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { supabase } from './supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: { username?: string; fullName?: string; avatarUrl?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    session,
    user,
    isLoading,
    isAuthenticated,
    error,
    setSession,
    signUp,
    signIn,
    signInWithPhone,
    verifyOTP,
    signOut,
    resetPassword,
    updateProfile,
  } = useAuthStore();

  useEffect(() => {
    // Check for an existing session when the app loads
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();

    // Set up a listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // --- THIS IS THE MODIFIED PART ---
        // Handle the special password recovery event
        if (event === 'PASSWORD_RECOVERY') {
          // When the user clicks the link in their email, Supabase emits this event.
          // We then immediately navigate them to the screen where they can set a new password.
          // Make sure you have a screen at this route, e.g., '(auth)/new-password.tsx'.
          router.replace('/(auth)/new-password');
          return; // Stop further execution for this event
        }

        // For all other events (SIGNED_IN, SIGNED_OUT, etc.), update the session as normal.
        setSession(newSession);
      }
    );

    // Clean up the subscription when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setSession]); // setSession is a stable function from Zustand, so this effect runs once.

  const value = {
    session,
    user,
    isLoading,
    isAuthenticated,
    error,
    signUp,
    signIn,
    signInWithPhone,
    verifyOTP,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
