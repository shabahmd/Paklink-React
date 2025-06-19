import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

// Import the modified CommentsScreen
import CommentsScreen from '../screens/comments/CommentsScreen';

export default function Comments() {
  const { postId, postUserId } = useLocalSearchParams<{ postId: string; postUserId: string }>();
  const router = useRouter();
  
  useEffect(() => {
    console.log('[DEBUG] Comments screen mounted');
    console.log('[DEBUG] Received params:', { postId, postUserId });
    
    if (!postId || !postUserId) {
      console.log('[DEBUG] Missing required params, navigating back');
      router.back();
    }
  }, [postId, postUserId, router]);
  
  if (!postId || !postUserId) {
    console.log('[DEBUG] Missing required params, rendering empty container');
    return <View style={styles.container}><Stack.Screen options={{ title: 'Comments' }} /></View>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Comments',
          headerShown: true,
          headerBackVisible: true,
          headerBackTitle: 'Back',
          presentation: 'card',
          animation: 'slide_from_right',
        }} 
      />
      <CommentsScreen 
        postId={postId} 
        postUserId={postUserId} 
        onClose={() => {
          console.log('[DEBUG] Comments screen closing');
          router.back();
        }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerButton: {
    padding: wp('2%'),
  },
});
