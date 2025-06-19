import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

/**
 * Get the redirect URL for Supabase authentication
 * This handles both development and production environments
 */
export function getAuthRedirectUrl(): string {
  // Get the app URL scheme from Expo config
  const scheme = Array.isArray(Constants.expoConfig?.scheme) 
    ? Constants.expoConfig?.scheme[0] 
    : Constants.expoConfig?.scheme;

  if (!scheme) {
    throw new Error('No URL scheme found in app config');
  }

  // In development, we can use the Expo development URL
  if (__DEV__) {
    const redirectUrl = Linking.createURL('auth/callback');
    console.log('Development redirect URL:', redirectUrl);
    return redirectUrl;
  }

  // In production, use your app's URL scheme
  const productionUrl = `${scheme}://auth/callback`;
  console.log('Production redirect URL:', productionUrl);
  return productionUrl;
} 