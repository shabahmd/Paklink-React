import 'dotenv/config'; // Add this line at the top


export default {
  expo: {
    name: "Paklink",
    slug: "paklink",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.paklink.app",
      associatedDomains: [
        "applinks:paklink.app",
        "applinks:localhost:3000"
      ]
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.paklink.app",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "paklink",
              host: "*",
              pathPrefix: "/"
            },
            {
              scheme: "http",
              host: "localhost",
              port: "3000",
              pathPrefix: "/"
            },
            {
              scheme: "https",
              host: "paklink.app",
              pathPrefix: "/"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID
      }
    },
    scheme: ["paklink", "exp+paklink"],
    plugins: [
      [
        "expo-router",
        {
          origin: "paklink://"
        }
      ]
    ]
  }
} 