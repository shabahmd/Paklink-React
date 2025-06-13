import { Text, View } from '@/components/ui/Themed';
import { useAuth } from '@/lib/AuthContext';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  const { signIn, signUp, signInWithPhone, verifyOTP, isLoading, error, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      Alert.alert('Authentication Error', error.message);
    }
  }, [error]);

  const handleAuth = async () => {
    try {
      if (isPhoneLogin) {
        if (showOtpInput) {
          await verifyOTP(phone, otp);
        } else {
          await signInWithPhone(phone);
          setShowOtpInput(true);
        }
      } else {
        if (isLogin) {
          await signIn(email, password);
        } else {
          await signUp(email, password);
          Alert.alert(
            'Verification Email Sent',
            'Please check your email for a verification link before logging in.'
          );
          setIsLogin(true);
        }
      }
    } catch (error) {
      // Error is already handled by the store and useEffect
      console.error('Authentication error:', error);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setIsPhoneLogin(false);
    setShowOtpInput(false);
    setEmail('');
    setPassword('');
  };

  const togglePhoneLogin = () => {
    setIsPhoneLogin(!isPhoneLogin);
    setShowOtpInput(false);
    setPhone('');
    setOtp('');
    setEmail('');
    setPassword('');
  };

  const validateForm = () => {
    if (isPhoneLogin) {
      if (showOtpInput) {
        return otp.length >= 6;
      }
      return phone.length >= 10;
    }
    return email.length > 0 && password.length >= 6;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.title}>
          {isPhoneLogin
            ? showOtpInput
              ? 'Enter OTP'
              : 'Phone Login'
            : isLogin
            ? 'Login'
            : 'Sign Up'}
        </Text>

        {isPhoneLogin ? (
          <>
            {!showOtpInput && (
              <TextInput
                style={styles.input}
                placeholder="Phone Number (with country code)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                editable={!isLoading}
              />
            )}

            {showOtpInput && (
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                editable={!isLoading}
                maxLength={6}
              />
            )}
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.button, (!validateForm() || isLoading) && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={!validateForm() || isLoading}>
          <Text style={styles.buttonText}>
            {isLoading
              ? 'Loading...'
              : isPhoneLogin
              ? showOtpInput
                ? 'Verify OTP'
                : 'Send OTP'
              : isLogin
              ? 'Login'
              : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchButton} 
          onPress={toggleAuthMode}
          disabled={isLoading}>
          <Text style={[styles.switchText, isLoading && styles.textDisabled]}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchButton} 
          onPress={togglePhoneLogin}
          disabled={isLoading}>
          <Text style={[styles.switchText, isLoading && styles.textDisabled]}>
            {isPhoneLogin
              ? 'Use Email Instead'
              : 'Login with Phone Number'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchButton} 
          onPress={() => router.push('/forgot-password')}
          disabled={isLoading}>
          <Text style={[styles.switchText, isLoading && styles.textDisabled]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  switchButton: {
    marginTop: 20,
  },
  switchText: {
    color: '#2196F3',
    fontSize: 14,
  },
  textDisabled: {
    color: '#B0BEC5',
  },
}); 