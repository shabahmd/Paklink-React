import React, { useState } from 'react';
import { StyleSheet, Image, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { UserProfile } from '../types/user.types';

const mockUser: UserProfile = {
  id: '1',
  name: 'John Doe',
  username: 'johndoe',
  avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
  coverPhotoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  bio: 'Software developer. Coffee lover. Traveler.',
  location: 'San Francisco, CA',
  website: 'https://johndoe.com',
  followersCount: 1200,
  followingCount: 300,
  postsCount: 42,
};

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [editing, setEditing] = useState(false);

  // Placeholder for edit functionality
  const handleEdit = () => setEditing(true);
  const handleSave = (updated: UserProfile) => {
    setUser(updated);
    setEditing(false);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Cover Photo */}
      <Image source={{ uri: user.coverPhotoUrl }} style={styles.coverPhoto} />
      {/* Profile Picture */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
      </View>
      {/* Header Info */}
      <View style={styles.headerInfo}>
        <ThemedText type="title">{user.name}</ThemedText>
        <ThemedText type="subtitle">@{user.username}</ThemedText>
        {user.bio && <ThemedText style={styles.bio}>{user.bio}</ThemedText>}
        <View style={styles.statsRow}>
          <ThemedText>{user.followersCount} Followers</ThemedText>
          <ThemedText> • </ThemedText>
          <ThemedText>{user.followingCount} Following</ThemedText>
          <ThemedText> • </ThemedText>
          <ThemedText>{user.postsCount} Posts</ThemedText>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <ThemedText type="link">Edit Profile</ThemedText>
        </TouchableOpacity>
      </View>
      {/* TODO: Profile Tabs (Posts, About, Photos, etc.) */}
      {/* TODO: Profile Editing Modal */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  coverPhoto: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  avatarContainer: {
    position: 'absolute',
    top: 130,
    left: 20,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  headerInfo: {
    marginTop: 60,
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  bio: {
    marginTop: 8,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  editButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#e7e7e7',
  },
});
