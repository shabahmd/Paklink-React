// import { createClient } from '@supabase/supabase-js';
// import Constants from 'expo-constants';
// import * as SecureStore from 'expo-secure-store';
// import 'react-native-url-polyfill/auto';

// // --- Create a Storage Adapter for Supabase using expo-secure-store ---
// // This object provides the necessary functions (getItem, setItem, removeItem)
// // that Supabase needs to securely save the session on the device.
// const ExpoSecureStoreAdapter = {
//   getItem: (key: string) => {
//     // We are using SecureStore to get the item from the device's storage.
//     return SecureStore.getItemAsync(key);
//   },
//   setItem: (key: string, value: string) => {
//     // We are using SecureStore to save the item to the device's storage.
//     SecureStore.setItemAsync(key, value);
//   },
//   removeItem: (key: string) => {
//     // We are using SecureStore to remove the item from the device's storage.
//     SecureStore.deleteItemAsync(key);
//   },
// };

// // --- Supabase Client Initialization ---

// // Get the Supabase credentials from your app's configuration.
// const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
// const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

// // Check if the credentials are provided.
// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase configuration. Please check your app.config.js or environment variables.');
// }

// // Create and export the Supabase client with the persistence options.
// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     // Pass the custom storage adapter to Supabase.
//     storage: ExpoSecureStoreAdapter,
//     // Automatically refresh the session token.
//     autoRefreshToken: true,
//     // Persist the session on the device.
//     persistSession: true,
//     // Don't detect the session from the URL, as this is a mobile app.
//     detectSessionInUrl: false,
//   },
// });
