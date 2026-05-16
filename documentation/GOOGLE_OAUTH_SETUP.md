# Google OAuth 2.0 Credentials Setup Guide

This guide walks you through creating Google OAuth 2.0 credentials for DriveDE's Google Sign-In feature.

## Prerequisites
- A Google Account
- Access to Google Cloud Console (https://console.cloud.google.com/)
- Your Supabase project URL: `https://zgmhkvpctiineanjmvga.supabase.co`

## Step-by-Step Instructions

### Step 1: Create or Select a Google Cloud Project

1. Navigate to https://console.cloud.google.com/
2. Sign in with your Google Account
3. At the top of the page, click on the **Project** dropdown
4. Click **NEW PROJECT**
5. Enter a project name (e.g., "DriveDE")
6. Click **CREATE**
7. Wait for the project to be created (this may take a minute)
8. Select the newly created project from the dropdown

### Step 2: Enable Google+ API

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on **Google+ API**
4. Click the blue **ENABLE** button
5. Wait for the API to be enabled

### Step 3: Create OAuth 2.0 Credentials

1. In the left sidebar, go to **APIs & Services** → **Credentials**
2. Click on **+ CREATE CREDENTIALS** button
3. Select **OAuth client ID**
4. If prompted to create an OAuth consent screen, click **CREATE CONSENT SCREEN**
   - Choose **External** user type
   - Click **CREATE**
   
#### Configure OAuth Consent Screen:
1. **App name**: Enter "DriveDE"
2. **User support email**: Enter your email address
3. **Developer contact**: Enter your email address
4. Click **SAVE AND CONTINUE**
5. On the **Scopes** page, click **SAVE AND CONTINUE**
6. On the **Test users** page, click **SAVE AND CONTINUE**
7. Review and click **BACK TO DASHBOARD**

### Step 4: Create OAuth 2.0 Client ID

1. Back on the **Credentials** page, click **+ CREATE CREDENTIALS** again
2. Select **OAuth client ID**
3. For **Application type**, select **Web application**
4. Enter a name (e.g., "DriveDE Web Client")
5. Under **Authorized redirect URIs**, click **+ ADD URI**
6. Paste this redirect URI:
   ```
   https://zgmhkvpctiineanjmvga.supabase.co/auth/v1/callback
   ```
7. Click **CREATE**
8. A popup will appear with your credentials:
   - **Client ID**: Copy this value
   - **Client Secret**: Copy this value

### Step 5: Save Your Credentials

Keep these values safe:
- **Client ID**: `[YOUR_CLIENT_ID]`
- **Client Secret**: `[YOUR_CLIENT_SECRET]`

## Next Steps

Once you have your Client ID and Client Secret:

1. Navigate to Supabase Dashboard: https://supabase.com/dashboard/project/zgmhkvpctiineanjmvga/auth/providers
2. Find the **Google** provider
3. Enable it if not already enabled
4. Paste your **Client ID** in the "Client ID" field
5. Paste your **Client Secret** in the "Client Secret" field
6. Click **SAVE**
7. Test Google Sign-In in the DriveDE app

## Troubleshooting

### Error: "Unsupported provider: provider is not enabled"
- Make sure you clicked **SAVE** in the Supabase Google provider settings
- Verify that both Client ID and Client Secret are correctly pasted
- The credentials must be from a **Web application** type, not a Mobile or Desktop application

### Error: "redirect_uri_mismatch"
- Verify the redirect URI is exactly: `https://zgmhkvpctiineanjmvga.supabase.co/auth/v1/callback`
- Check that it's added in Google Cloud Console under your OAuth 2.0 credentials
- There should be no extra spaces or characters

### Google+ API not showing up
- Make sure you're searching for "Google+ API" (with the plus sign)
- If you still can't find it, try searching for just "Google API"
- It might be labeled as "Google+ API" or "Google Identity API" depending on your region

## Security Notes

- **Never share your Client Secret** publicly or commit it to version control
- The Client ID is safe to include in client-side code
- The Client Secret should only be used on your backend (not included in this frontend app)
- Keep your Google Cloud project security settings configured appropriately

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Auth Setup](https://supabase.com/docs/guides/auth/oauth2)
- [Creating OAuth 2.0 Credentials](https://developers.google.com/workspace/guides/create-credentials)

