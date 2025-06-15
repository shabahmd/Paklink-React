import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { usePostsContext } from '../../contexts/posts-context';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreatePostModal({ visible, onClose }: CreatePostModalProps) {
  const { addPost } = usePostsContext();
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!content.trim() && !imageUri) return;
    setIsSubmitting(true);
    await addPost({
      user: {
        id: 'me',
        name: 'You',
        avatarUri: 'https://i.pravatar.cc/150?img=0',
      },
      content: content.trim(),
      imageUri,
    });
    setContent('');
    setImageUri(undefined);
    setIsSubmitting(false);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white dark:bg-neutral-900 rounded-t-2xl p-6">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Create Post</Text>
          <TextInput
            className="border border-gray-200 dark:border-neutral-700 rounded-lg p-3 text-base text-gray-900 dark:text-white mb-3"
            placeholder="What's on your mind?"
            placeholderTextColor="#9ca3af"
            multiline
            value={content}
            onChangeText={setContent}
            accessible
            accessibilityLabel="Post content"
          />
          {imageUri && (
            <Image source={{ uri: imageUri }} className="w-full h-48 rounded-lg mb-3" resizeMode="cover" />
          )}
          <View className="flex-row space-x-3 mb-3">
            <TouchableOpacity
              className="flex-1 bg-blue-100 dark:bg-blue-900 rounded-lg p-3 items-center"
              onPress={pickImage}
              accessibilityRole="button"
              accessibilityLabel="Pick an image"
            >
              <Text className="text-blue-700 dark:text-blue-300 font-semibold">Add Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-600 rounded-lg p-3 items-center"
              onPress={handleSubmit}
              disabled={isSubmitting || (!content.trim() && !imageUri)}
              accessibilityRole="button"
              accessibilityLabel="Post"
            >
              <Text className="text-white font-semibold">{isSubmitting ? 'Posting...' : 'Post'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="items-center mt-1"
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
          >
            <Text className="text-gray-500 dark:text-gray-400">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
} 