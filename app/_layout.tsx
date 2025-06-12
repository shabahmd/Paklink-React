import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // This effect is responsible for redirecting the user based on their auth state.
    if (!isLoading) {
      const inAuthGroup = segments[0] === '(auth)';

      if (!session && !inAuthGroup) {
        // Redirect to login if not authenticated and not already in the auth flow.
        router.replace('/(auth)/login');
      } else if (session && inAuthGroup) {
        // Redirect to the main apprr if authenticated and currently in the auth flow.
        router.replace('/(tabs)');
      }
    }
  }, [session, segments, isLoading]);

  // The SafeAreaView and StatusBar are now inside the component that renders the Stack.
  // This ensures they are not direct children of the ThemeProvider in the layout file.
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {!session ? (
          // Auth stack (login, signup, etc.)
          <Stack.Screen name="(auth)" />
        ) : (
          // App stack (tabs, profile, settings, etc.)
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Show a loading screen or splash screen while fonts are loading.
  if (!loaded) {
    return null; // Or return a custom loading component
  }

  return (
    // The AuthProvider wraps everything, making the auth state available everywhere.
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* ThemeProvider now has only one child, which satisfies expo-router's rule. */}
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}
