import { Stack } from 'expo-router';
import React from 'react';
import CreatePostScreen from '../screens/CreatePostScreen';

export default function CreatePostLayout() {
  return (
    <>
      <Stack.Screen options={{ title: 'Create Post' }} />
      <CreatePostScreen />
    </>
  );
}
