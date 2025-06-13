import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

interface FileUploadOptions {
  uri: string;
  bucketName: string;
  path: string;
  contentType?: string;
}

/**
 * Uploads a file to Supabase Storage
 * @param options File upload options
 * @returns The public URL of the uploaded file
 */
export async function uploadFile({
  uri,
  bucketName,
  path,
  contentType = 'image/jpeg',
}: FileUploadOptions): Promise<string | null> {
  try {
    // Handle file URI based on platform
    const fileUri = Platform.OS === 'web' ? uri : uri.startsWith('file://') ? uri : `file://${uri}`;
    
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, arrayBuffer, {
        contentType,
        upsert: true,
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    
    // Get the public URL of the uploaded file
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
}

/**
 * Generates a unique filename for upload
 * @param userId User ID
 * @param fileExtension File extension (e.g., 'jpg', 'png')
 * @returns A unique filename
 */
export function generateUniqueFilename(userId: string, fileExtension: string): string {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 10);
  return `${userId}_${timestamp}_${randomString}.${fileExtension}`;
}

/**
 * Deletes a file from Supabase Storage
 * @param bucketName Bucket name
 * @param path File path
 * @returns boolean indicating success
 */
export async function deleteFile(bucketName: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucketName).remove([path]);
    
    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
}

/**
 * Extracts file extension from a URI or filename
 * @param uri File URI or filename
 * @returns File extension without the dot
 */
export function getFileExtension(uri: string): string {
  return uri.split('.').pop()?.toLowerCase() || 'jpg';
}

/**
 * Gets the content type based on file extension
 * @param extension File extension
 * @returns Content type string
 */
export function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  
  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
} 