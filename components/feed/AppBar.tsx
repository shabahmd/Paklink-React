import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export function AppBar() {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800">
      {/* Logo (replace with Image if you have a logo asset) */}
      <Text className="text-2xl font-extrabold text-blue-600 tracking-tight">facebook</Text>
      <View className="flex-row items-center space-x-3">
        <TouchableOpacity className="p-2 rounded-full bg-gray-100 dark:bg-neutral-800">
          <Ionicons name="search" size={22} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2 rounded-full bg-gray-100 dark:bg-neutral-800">
          <Ionicons name="chatbubble-ellipses" size={22} color="#2563eb" />
        </TouchableOpacity>
      </View>
    </View>
  );
} 