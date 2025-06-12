import { Session, User } from '@supabase/supabase-js';
import { create, StateCreator } from 'zustand';
import * as AuthService from '../auth'; // Assuming this is your Supabase service file

// Define the shape of your state
interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

// Define the shape of your actions (the functions)
interface AuthActions {
  setSession: (session: Session | null) => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: { username?: string; fullName?: string; avatarUrl?: string }) => Promise<void>;
}

// Define the complete store type for type-safety
type AuthStore = AuthState & AuthActions;

// This is the core logic for creating your store.
// By separating state and actions, the store is easier to read and maintain.
const authStoreCreator: StateCreator<AuthStore> = (set) => ({
  // --- INITIAL STATE ---
  session: null,
  user: null,
  isLoading: false, // Start with false, as the app is not initially in a loading state
  isAuthenticated: false,
  error: null,

  // --- ACTIONS ---

  // A basic action to set the session and derived user/auth state
  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
    });
  },

  // Sign Up Action
  signUp: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Assuming your service function is named signUpWithEmail
      await AuthService.signUpWithEmail(email, password);
    } catch (error: any) {
      console.error('Zustand signUp error:', error);
      set({ error });
      throw error; // Re-throw the error if you want UI components to be able to catch it too
    } finally {
      set({ isLoading: false }); // ALWAYS stop loading
    }
  },

  // Sign In Action
  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Assuming your service function is named signInWithEmail
      await AuthService.signInWithEmail(email, password);
    } catch (error: any) {
      console.error('Zustand signIn error:', error);
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false }); // ALWAYS stop loading
    }
  },

  // Sign In with Phone Action
  signInWithPhone: async (phone) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.signInWithPhone(phone);
    } catch (error: any) {
      console.error('Zustand signInWithPhone error:', error);
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false }); // ALWAYS stop loading
    }
  },

  // Verify OTP Action
  verifyOTP: async (phone, token) => {
    set({ isLoading: true, error: null });
    try {
      // Assuming your service function is named verifyPhoneOTP
      await AuthService.verifyPhoneOTP(phone, token);
    } catch (error: any) {
      console.error('Zustand verifyOTP error:', error);
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false }); // ALWAYS stop loading
    }
  },

  // Sign Out Action
  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.signOut();
      set({ session: null, user: null, isAuthenticated: false }); // Clear session state
    } catch (error: any) {
      console.error('Zustand signOut error:', error);
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Reset Password Action
  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.resetPassword(email);
    } catch (error: any) {
      console.error('Zustand resetPassword error:', error);
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Update Profile Action
  updateProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.updateProfile(updates);
    } catch (error: any) {
      console.error('Zustand updateProfile error:', error);
      set({ error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
});

// Create the hook for use in your components
export const useAuthStore = create<AuthStore>(authStoreCreator);
