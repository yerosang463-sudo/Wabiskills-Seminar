# Google OAuth Redirect URI Fix

## Problem
You're getting `Error 400: redirect_uri_mismatch` when trying to sign in with Google.

## Solution
You need to update the Google OAuth configuration in Google Cloud Console to match the correct callback URL.

## Steps to Fix

### 1. Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Make sure you're signed in with the account that owns the OAuth app
3. Go to: APIs & Services → Credentials

### 2. Find Your OAuth 2.0 Client ID
1. Look for the client ID: `97174287117-tor23i946289d0srje657v8442s1eplm.apps.googleusercontent.com`
2. Click on the client name to edit it

### 3. Update Authorized Redirect URIs
In the "Authorized redirect URIs" section, add this URL:
```
https://wabiskills-seminar-1.onrender.com/api/auth/google/callback
```

**Important:**
- Make sure there are NO trailing slashes
- Use HTTPS (not HTTP)
- The URL must match EXACTLY

### 4. Save Changes
1. Click "Save" or "Update" at the bottom
2. Wait a few minutes for changes to propagate

### 5. Test Again
1. Go back to your application
2. Try signing in with Google again
3. It should work now!

## Current Configuration

Your backend is configured with:
- **Client ID**: `97174287117-tor23i946289d0srje657v8442s1eplm.apps.googleusercontent.com`
- **Callback URL**: `https://wabiskills-seminar-1.onrender.com/api/auth/google/callback`

## Troubleshooting

If it still doesn't work:
1. Double-check the URL spelling
2. Make sure there's no trailing slash
3. Wait 5-10 minutes for Google to update
4. Clear your browser cache
5. Try incognito/private browsing mode

## What Was Fixed

I updated your backend configuration to use the correct callback URL that matches your deployed frontend URL. The mismatch was causing Google to reject the OAuth request.
