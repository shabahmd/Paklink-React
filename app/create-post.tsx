import CreatePostScreen from '@/src/screens/CreatePostScreen';
import { Stack } from 'expo-router';
import React from 'react';

export default function CreatePostRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Post',
          presentation: 'modal',
        }}
      />
      <CreatePostScreen />
    </>
  );
}
