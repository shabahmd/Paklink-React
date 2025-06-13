import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/lib/AuthContext';
import { usePathname } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session } = useAuth();
  const pathname = usePathname();
  const router = useRouter(); // Add router for the button
  
  // This redirect logic can be simplified or moved to the root layout, but it's okay here for now.
  React.useEffect(() => {
    if (!session && pathname !== '/login') {
      router.replace('/(auth)/login');
    }
  }, [session, pathname, router]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // FIX: We now want to show the header by default.
        headerShown: true, 
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home Feed', // Set the title here
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          // FIX: The "Create Post" button is now defined here, in the correct place.
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/create-post')}
              style={{ padding: 8, marginRight: 8 }}
            >
              <Ionicons name="add-circle" size={28} color={Colors[colorScheme ?? 'light'].tint} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
