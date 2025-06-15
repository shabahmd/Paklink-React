import { Session, User } from '@supabase/supabase-js';
import { create, StateCreator } from 'zustand';
import * as SupabaseService from '../../services/supabase/supabase';
import { Profile } from '../../services/supabase/supabase';

// Define the shape of your state
interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

// Define the shape of your actions
interface AuthActions {
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  uploadAvatar: (uri: string) => Promise<string>;
  loadProfile: () => Promise<void>;
}

// Define the complete store type
type AuthStore = AuthState & AuthActions;

// Core store logic
const authStoreCreator: StateCreator<AuthStore> = (set, get) => ({
  // --- INITIAL STATE ---
  session: null,
  user: null,
  profile: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  // --- ACTIONS ---
  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
    });
  },

  setProfile: (profile) => {
    set({ profile });
  },

  loadProfile: async () => {
    const { isAuthenticated } = get();
    if (!isAuthenticated) return;

    set({ isLoading: true, error: null });
    try {
      const profile = await SupabaseService.getProfile();
      set({ profile });
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      set({ error });
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { session } = await SupabaseService.signUpWithEmail(email, password);
      set({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { session } = await SupabaseService.signInWithEmail(email, password);
      set({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
      });
      // Load profile after successful sign in
      await get().loadProfile();
    } catch (error: any) {
      console.error('Sign in error:', error);
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithPhone: async (phone) => {
    set({ isLoading: true, error: null });
    try {
      await SupabaseService.signInWithPhone(phone);
    } catch (error: any) {
      console.error('Phone sign in error:', error);
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyOTP: async (phone, token) => {
    set({ isLoading: true, error: null });
    try {
      const { session } = await SupabaseService.verifyPhoneOTP(phone, token);
      set({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
      });
      // Load profile after successful verification
      await get().loadProfile();
    } catch (error: any) {
      console.error('OTP verification error:', error);
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await SupabaseService.signOut();
      set({
        session: null,
        user: null,
        profile: null,
        isAuthenticated: false,
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await SupabaseService.resetPassword(email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      await SupabaseService.updateProfile(updates);
      // Reload profile to get updated data
      await get().loadProfile();
    } catch (error: any) {
      console.error('Profile update error:', error);
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  uploadAvatar: async (uri) => {
    set({ isLoading: true, error: null });
    try {
      const publicUrl = await SupabaseService.uploadAvatar(uri);
      // Profile will be updated automatically in the uploadAvatar function
      await get().loadProfile();
      return publicUrl;
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
});

// Create and export the hook
export const useAuthStore = create<AuthStore>(authStoreCreator); 