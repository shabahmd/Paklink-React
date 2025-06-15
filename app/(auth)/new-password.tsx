// (auth)/new-password.tsx

import { Text, View } from '@/components/ui/Themed';
// import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
export default function NewPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { setNewPassword, isLoading } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  
  // Get URL parameters
  useEffect(() => {
    const getInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          const url = new URL(initialUrl);
          const tokenFromUrl = url.searchParams.get('token_hash') || url.searchParams.get('access_token');
          if (tokenFromUrl) {
            setToken(tokenFromUrl);
          } else {
            Alert.alert('Error', 'Invalid or expired reset link', [
              { text: 'OK', onPress: () => router.replace('/login') }
            ]);
          }
        }
      } catch (error) {
        console.error('Error getting initial URL:', error);
      }
    };

    getInitialURL();

    // Also listen for incoming links while the screen is mounted
    const subscription = Linking.addEventListener('url', (event) => {
      const url = new URL(event.url);
      const tokenFromUrl = url.searchParams.get('token_hash') || url.searchParams.get('access_token');
      if (tokenFromUrl) {
        setToken(tokenFromUrl);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleSetNewPassword = async () => {
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    try {
      await setNewPassword(email, password);
      Alert.alert('Success', 'Password reset. You are now logged in.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  // If no token is present, show loading or redirect
  useEffect(() => {
    if (token === null) {
      // Wait briefly to see if we get a token
      const timeout = setTimeout(() => {
        if (token === null) {
          Alert.alert('Error', 'Invalid or expired reset link', [
            { text: 'OK', onPress: () => router.replace('/login') }
          ]);
        }
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [token]);

  if (token === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Set a New Password</Text>
        <Text style={styles.subtitle}>
          Please enter and confirm your new password
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter your new password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSetNewPassword}
          disabled={isLoading}>
          <Text style={styles.buttonText}>
            {isLoading ? 'Saving...' : 'Save New Password'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});