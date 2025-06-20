import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { UserProfile } from '../../types/user.types';

interface EditProfileModalProps {
  visible: boolean;
  user: UserProfile;
  onSave: (user: UserProfile) => void;
  onClose: () => void;
}

export default function EditProfileModal({ visible, user, onSave, onClose }: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(user.coverPhotoUrl);

  const handleSave = () => {
    onSave({ ...user, name, bio, avatarUrl, coverPhotoUrl });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <ThemedView style={styles.modalContainer}>
        <ThemedText type="title">Edit Profile</ThemedText>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Name"
        />
        <TextInput
          style={styles.input}
          value={bio}
          onChangeText={setBio}
          placeholder="Bio"
        />
        <TextInput
          style={styles.input}
          value={avatarUrl}
          onChangeText={setAvatarUrl}
          placeholder="Avatar URL"
        />
        <TextInput
          style={styles.input}
          value={coverPhotoUrl}
          onChangeText={setCoverPhotoUrl}
          placeholder="Cover Photo URL"
        />
        <View style={styles.previewRow}>
          <Image source={{ uri: avatarUrl }} style={styles.avatarPreview} />
          <Image source={{ uri: coverPhotoUrl }} style={styles.coverPreview} />
        </View>
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <ThemedText type="link">Save</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <ThemedText type="link">Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    marginTop: 100,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
    fontSize: 16,
  },
  previewRow: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  coverPreview: {
    width: 120,
    height: 56,
    borderRadius: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 24,
    width: '100%',
    justifyContent: 'space-evenly',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#e7e7e7',
  },
});
