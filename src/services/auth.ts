import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export async function signUp(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
}

export async function signIn(
  email: string,
  password: string
): Promise<{ session: Session; user: User }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.session || !data.user) throw new Error('No session or user data');

  return { session: data.session, user: data.user };
}

export async function signInWithPhone(phone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    phone,
  });

  if (error) throw error;
}

export async function verifyOTP(
  phone: string,
  token: string
): Promise<{ session: Session; user: User }> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });

  if (error) throw error;
  if (!data.session || !data.user) throw new Error('No session or user data');

  return { session: data.session, user: data.user };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function updateProfile(updates: Partial<User>): Promise<User> {
  const { data, error } = await supabase.auth.updateUser(updates);
  if (error) throw error;
  if (!data.user) throw new Error('No user data');
  return data.user;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfileData(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Initialize Supabase auth state listener
export function initAuthStateListener(callback: (session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
} 