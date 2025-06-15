import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';

interface CreatePostButtonProps {
  userAvatar: string;
  onPress: () => void;
}

export function CreatePostButton({ userAvatar, onPress }: CreatePostButtonProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: userAvatar }} style={styles.avatar} />
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>What's on your mind?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  button: {
    flex: 1,
    backgroundColor: colors.gray100,
    padding: 12,
    borderRadius: 20,
  },
  buttonText: {
    color: colors.gray600,
    fontSize: 16,
  },
}); 