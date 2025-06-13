import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/AuthContext';

import { generateUniqueFilename, getContentType, getFileExtension, uploadFile } from '../utils/storage';

import { createPost } from '../services/posts';

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a post');
      return;
    }

    if (!content.trim() && !selectedImage) {
      Alert.alert('Error', 'Please enter some content or select an image');
      return;
    }

    setIsLoading(true);

    try {
      let mediaUrl = null;

      if (selectedImage) {
        const fileExt = getFileExtension(selectedImage);
        const fileName = generateUniqueFilename(user.id, fileExt);
        const contentType = getContentType(fileExt);

        mediaUrl = await uploadFile({
          uri: selectedImage,
          bucketName: 'post-images',
          path: fileName,
          contentType,
        });

        if (!mediaUrl) {
          throw new Error('Failed to upload image');
        }
      }

      const newPost = await createPost({
        user_id: user.id,
        text_content: content.trim(),
        media_url: mediaUrl,
        media_type: mediaUrl ? 'image' : null,
      });

      if (!newPost) {
        throw new Error('Failed to create post');
      }

      // Success! Navigate back
      router.back();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert(
        'Error',
        'Failed to create post. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        multiline
        placeholder="What's on your mind?"
        value={content}
        onChangeText={setContent}
        editable={!isLoading}
      />

      {selectedImage && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => setSelectedImage(null)}
            disabled={isLoading}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={pickImage}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Add Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            (!content.trim() && !selectedImage) && styles.buttonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isLoading || (!content.trim() && !selectedImage)}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 120,
    color: '#000',
  },
  imageContainer: {
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 192,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#dc3545',
    borderRadius: 20,
    padding: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
}); 