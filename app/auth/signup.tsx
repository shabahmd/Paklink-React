import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function SignUp() {
  const { signUp } = useAuth();

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-8">Sign Up</Text>
      <Link href="/auth/signin" className="text-blue-500">
        Already have an account? Sign in
      </Link>
    </View>
  );
} 