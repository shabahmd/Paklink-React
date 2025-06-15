import { Redirect } from 'expo-router';

// Redirect to the tabs route
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
