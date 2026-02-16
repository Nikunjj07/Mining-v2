# Google OAuth Setup Guide

## Overview

Google OAuth has been added to the login page as an alternative to email/password authentication. Users can now sign in with their Google account.

## What Was Added

### 1. AuthContext Updates
- Added `signInWithGoogle()` function
- Configured OAuth redirect to homepage after successful login
- Integrated with Supabase Auth OAuth flow

### 2. Login Page Updates
- **Google Sign-In Button** - Styled with official Google branding
- **Divider** - "Or continue with email" separator
- **Error Handling** - Displays errors for failed Google sign-in attempts

## Supabase Configuration Required

To enable Google OAuth, you need to configure it in your Supabase dashboard:

### Step 1: Enable Google Provider

1. **Go to** Supabase Dashboard → **Authentication** → **Providers**
2. **Find** "Google" in the list
3. **Toggle** it to "Enabled"

### Step 2: Configure Google OAuth Credentials

You have two options:

#### Option A: Use Supabase's Google OAuth (Easiest)
- Supabase provides default Google OAuth credentials
- **No setup required** - just enable the provider
- ⚠️ Limited to Supabase's domain (may show "unverified app" warning)

#### Option B: Use Your Own Google OAuth Credentials (Recommended for Production)

1. **Go to** [Google Cloud Console](https://console.cloud.google.com/)
2. **Create a new project** (or select existing)
3. **Enable** Google+ API
4. **Go to** Credentials → Create Credentials → OAuth 2.0 Client ID
5. **Configure OAuth consent screen:**
   - App name: "Disaster Management"
   - User support email: Your email
   - Developer contact: Your email
6. **Create OAuth Client ID:**
   - Application type: **Web application**
   - Name: "Disaster Management App"
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     https://qjvwzwwawrjbrpszhbgu.supabase.co
     ```
   - **Authorized redirect URIs:**
     ```
     https://qjvwzwwawrjbrpszhbgu.supabase.co/auth/v1/callback
     ```
7. **Copy** the Client ID and Client Secret
8. **Paste** them into Supabase:
   - Go back to Supabase → Authentication → Providers → Google
   - Enter Client ID
   - Enter Client Secret
   - Click "Save"

### Step 3: Test Google Login

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open** http://localhost:5173

3. **Click** "Continue with Google"

4. **Select** your Google account

5. **First-time users:**
   - After Google authentication, you'll be redirected back
   - ⚠️ **Important:** You need to create a user record in the `users` table
   - Get the user ID from Supabase → Authentication → Users
   - Run this SQL:
     ```sql
     INSERT INTO users (id, email, full_name, role)
     VALUES ('USER_ID_FROM_AUTH', 'your-google-email@gmail.com', 'Your Name', 'admin');
     ```

## How It Works

1. User clicks "Continue with Google"
2. Redirected to Google OAuth consent screen
3. User approves access
4. Google redirects back to Supabase with auth code
5. Supabase exchanges code for user info
6. User is authenticated and redirected to `/`
7. `RoleBasedRedirect` component sends them to appropriate dashboard

## Automatic User Creation (Optional Enhancement)

Currently, Google OAuth users need manual user record creation. To automate this:

### Option 1: Database Trigger (Recommended)

Create a Supabase function that automatically creates a user record when someone signs up via Google:

```sql
-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'worker' -- Default role for Google sign-ups
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Option 2: Signup Page

Create a signup page where users can:
1. Sign in with Google (gets auth.users entry)
2. Select their role
3. Submit to create users table entry

## Security Notes

- Google OAuth is secure and industry-standard
- User passwords are never stored (Google handles authentication)
- Supabase manages the OAuth flow securely
- Session tokens are encrypted and stored securely

## Troubleshooting

### "Failed to sign in with Google"
- Check that Google provider is enabled in Supabase
- Verify redirect URIs are correctly configured
- Check browser console for detailed error messages

### User authenticated but can't access dashboards
- User record missing in `users` table
- Run the SQL query above to create the user record
- Or implement the database trigger for automatic creation

### "This app isn't verified" warning
- Normal when using your own Google OAuth credentials in development
- Click "Advanced" → "Go to [app name] (unsafe)" to proceed
- For production, submit app for Google verification
