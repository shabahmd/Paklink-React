import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { PostsProvider } from '../contexts/posts-context';
import { useColorScheme } from '../hooks/useColorScheme';

// Create the client instance outside the component to prevent re-creation.
const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return; // Wait until we know if the user is logged in or not.
    }

    const checkAuth = async () => {
      const inAuthGroup = segments[0] === '(auth)';
      
      // Check for skipLogin flag
      const skipLoginFlag = await AsyncStorage.getItem('skipLogin');
      const shouldSkipLogin = skipLoginFlag === 'true';
      
      if (!isAuthenticated && !inAuthGroup && !shouldSkipLogin) {
        // Redirect to login if not authenticated and not already in auth group
        router.replace('/(auth)/login');
      } else if (isAuthenticated && inAuthGroup) {
        // Redirect to tabs if authenticated but still in auth group
        router.replace('/(tabs)');
      } else if (shouldSkipLogin && inAuthGroup) {
        // If skipLogin is set, redirect to tabs even without auth
        router.replace('/(tabs)');
      }
    };

    checkAuth();
  }, [isLoading, isAuthenticated, segments, router]);

  // While the auth state is loading, don't render anything to prevent flashes.
  if (isLoading) {
    return null;
  }

  // This renders the navigation stack. The headers for each screen
  // are defined in their respective layouts (e.g., app/(tabs)/_layout.tsx).
  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="create-post" options={{ presentation: 'modal' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

// This is the root component for the entire app.
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      // Hide the splash screen after the fonts have loaded and the UI is ready.
      await SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  // Don't render anything until the fonts are loaded.
  if (!loaded) {
    return null;
  }

  // The order of providers is important.
  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <PostsProvider>
          <AuthProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <RootLayoutNav />
              <StatusBar style="auto" />
            </ThemeProvider>
          </AuthProvider>
        </PostsProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
