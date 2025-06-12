# Supabase Setup Guide for Paklink

This guide will walk you through setting up Supabase for authentication in the Paklink React Native app.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in or create an account.
2. Click "New Project" and fill in the details:
   - **Name**: Paklink (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the region closest to your target users
   - **Pricing Plan**: Free tier is sufficient for development

3. Click "Create new project" and wait for the project to be created (this may take a few minutes).

## 2. Configure Authentication

1. In your Supabase dashboard, go to "Authentication" in the left sidebar.
2. Under "Providers", enable the following methods:
   - **Email**: Enable "Enable Email Signup"
   - **Phone**: Enable "Enable Phone Signup"

3. Configure Email Templates (optional but recommended):
   - Go to "Email Templates"
   - Customize the templates for:
     - Confirmation
     - Invitation
     - Magic Link
     - Reset Password

4. Configure SMS Templates (if using phone authentication):
   - Go to "SMS Templates"
   - Customize the SMS OTP template

5. Under "URL Configuration", set up your app's URL:
   - **Site URL**: `exp://your-expo-url` (for development)
   - **Redirect URLs**: Add `paklink://` for deep linking in your app

## 3. Set Up Database Tables

1. Go to the "SQL Editor" in the Supabase dashboard.
2. Create a new query and paste the contents of the `supabase/migrations/20240821000000_create_profiles_table.sql` file.
3. Run the query to create the profiles table and set up the necessary triggers and policies.

## 4. Get API Keys

1. Go to "Project Settings" > "API" in the sidebar.
2. You'll need two keys:
   - **URL**: The URL of your Supabase project
   - **anon public**: The anonymous key for public operations

## 5. Configure Your App

1. Create a `.env` file in the root of your project with the following content:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   ```

2. Make sure these environment variables are properly loaded in your `app.config.js` file.

## 6. Test Authentication

1. Run your app with `npm start` or `expo start`.
2. Navigate to the login screen.
3. Test both email and phone authentication methods.
4. Verify that the user profile is created and can be accessed after login.

## Troubleshooting

- **Authentication Issues**: Check the Supabase logs in the dashboard under "Authentication" > "Logs".
- **Database Issues**: Check the SQL query logs under "Database" > "Logs".
- **API Issues**: Verify your API keys are correctly set in the `.env` file.
- **Deep Linking Issues**: Make sure your app's URL scheme is correctly configured in `app.json`.

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Native Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/reactnative)
- [Expo Deep Linking Documentation](https://docs.expo.dev/guides/deep-linking/) 