import * as Linking from 'expo-linking';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { supabase } from '../../../services/supabase/supabase';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL that opened the app
        const url = await Linking.getInitialURL();
        if (!url) return;

        // Parse the URL and get the tokens
        const urlObj = new URL(url);
        const searchParams = new URLSearchParams(urlObj.search);
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error.message);
            router.replace('/login');
            return;
          }

          console.log('Session set successfully');

          // Redirect based on the auth type
          if (type === 'recovery') {
            router.replace('/new-password');
          } else {
            router.replace('/(tabs)');
          }
        } else {
          // No tokens found, redirect to login
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.replace('/login');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Processing authentication...</Text>
    </View>
  );
} 