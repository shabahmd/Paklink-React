import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { AppBar } from '../../components/feed/AppBar';
import { CreatePostModal } from '../../components/feed/CreatePostModal';
import { Feed } from '../../components/feed/Feed';
import { StoryBar } from '../../components/feed/StoryBar';

export function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View className="flex-1 bg-gray-100 dark:bg-neutral-900">
      <AppBar />
      <StoryBar />
      <Feed />
      {/* Floating Action Button for creating a post */}
      <TouchableOpacity
        className="absolute bottom-8 right-6 bg-blue-600 rounded-full p-4 shadow-lg"
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Create Post"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      <CreatePostModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
} 