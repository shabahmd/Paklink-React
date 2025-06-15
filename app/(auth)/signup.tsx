import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupScreen() {
  const { signUp, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      await signUp(email, password);
      Alert.alert('Success', 'Account created! You are now logged in.');
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Signup Failed', e.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Sign Up</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, borderRadius: 8, marginBottom: 12, padding: 12 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderRadius: 8, marginBottom: 24, padding: 12 }}
      />
      <TouchableOpacity
        onPress={handleSignup}
        disabled={isLoading}
        style={{
          backgroundColor: '#16a34a',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{isLoading ? 'Loading...' : 'Sign Up'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 16 }}>
        <Text style={{ color: '#16a34a', textAlign: 'center' }}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
} 