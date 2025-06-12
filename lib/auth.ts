import { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Sign up a new user with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    return {
      user: data?.user || null,
      session: data?.session || null,
      error,
    };
  } catch (error) {
    console.error('Error during sign up:', error);
    return { user: null, session: null, error: error as AuthError };
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return {
      user: data?.user || null,
      session: data?.session || null,
      error,
    };
  } catch (error) {
    console.error('Error during sign in:', error);
    return { user: null, session: null, error: error as AuthError };
  }
};

/**
 * Sign in with phone number and OTP
 */
export const signInWithPhone = async (
  phone: string
): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    
    return { error };
  } catch (error) {
    console.error('Error during phone sign in:', error);
    return { error: error as AuthError };
  }
};

/**
 * Verify phone OTP
 */
export const verifyPhoneOTP = async (
  phone: string,
  token: string
): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    
    return {
      user: data?.user || null,
      session: data?.session || null,
      error,
    };
  } catch (error) {
    console.error('Error during OTP verification:', error);
    return { user: null, session: null, error: error as AuthError };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error during sign out:', error);
    return { error: error as AuthError };
  }
};

/**
 * Reset password for a user
 */
export const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'paklink://reset-password',
    });
    return { error };
  } catch (error) {
    console.error('Error during password reset:', error);
    return { error: error as AuthError };
  }
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  } catch (error) {
    console.error('Error updating password:', error);
    return { error: error as AuthError };
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (
  updates: { username?: string; fullName?: string; avatarUrl?: string }
): Promise<{ error: Error | null }> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      throw error || new Error('User not found');
    }
    
    // Update the user profile in the profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: updates.username,
        full_name: updates.fullName,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString(),
      });
      
    if (updateError) throw updateError;
    
    return { error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error: error as Error };
  }
}; 