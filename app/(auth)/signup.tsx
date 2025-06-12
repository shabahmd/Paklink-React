import { Text, View } from '@/components/ui/Themed';
import { useAuth } from '@/lib/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isPhoneSignup, setIsPhoneSignup] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  const { signUp, signInWithPhone, verifyOTP, isLoading } = useAuth();

  const handleSignup = async () => {
    try {
      if (isPhoneSignup) {
        if (showOtpInput) {
          await verifyOTP(phone, otp);
          router.replace('/(tabs)');
        } else {
          await signInWithPhone(phone);
          setShowOtpInput(true);
        }
      } else {
        if (password !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return;
        }
        await signUp(email, password);
        Alert.alert(
          'Verification Email Sent',
          'Please check your email for a verification link before logging in.'
        );
        router.replace('/login');
      }
    } catch (error) {
      Alert.alert('Signup Error', (error as Error).message);
    }
  };

  const togglePhoneSignup = () => {
    setIsPhoneSignup(!isPhoneSignup);
    setShowOtpInput(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isPhoneSignup
          ? showOtpInput
            ? 'Enter OTP'
            : 'Phone Signup'
          : 'Create Account'}
      </Text>

      {isPhoneSignup ? (
        <>
          {!showOtpInput && (
            <TextInput
              style={styles.input}
              placeholder="Phone Number (with country code)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          )}

          {showOtpInput && (
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
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
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={isLoading}>
        <Text style={styles.buttonText}>
          {isLoading
            ? 'Loading...'
            : isPhoneSignup
            ? showOtpInput
              ? 'Verify OTP'
              : 'Send OTP'
            : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.switchButton} onPress={() => router.replace('/login')}>
        <Text style={styles.switchText}>Already have an account? Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.switchButton} onPress={togglePhoneSignup}>
        <Text style={styles.switchText}>
          {isPhoneSignup
            ? 'Use Email Instead'
            : 'Sign Up with Phone Number'}
        </Text>
      </TouchableOpacity>
    </View>
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
}); 