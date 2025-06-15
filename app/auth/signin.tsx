import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function SignIn() {
  const { signIn } = useAuth();

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-8">Sign In</Text>
      <Link href="/auth/signup" className="text-blue-500">
        Don't have an account? Sign up
      </Link>
    </View>
  );
} 