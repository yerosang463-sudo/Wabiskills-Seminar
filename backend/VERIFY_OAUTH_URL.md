# Google OAuth URL Verification

## Current Backend Configuration
Your backend is configured to send this callback URL to Google:
```
https://wabiskills-seminar-1.onrender.com/api/auth/google/callback
```

## Required Google Cloud Console Setting
In Google Cloud Console, you MUST add this EXACT URL:

```
https://wabiskills-seminar-1.onrender.com/api/auth/google/callback
```

## Step-by-Step Instructions

### 1. Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account
3. Go to: APIs & Services → Credentials

### 2. Find Your OAuth App
1. Look for: "OAuth 2.0 Client IDs"
2. Find the client ID: `97174287117-tor23i946289d0srje657v8442s1eplm.apps.googleusercontent.com`
3. Click on the client name to edit

### 3. Update Authorized Redirect URIs
1. Scroll down to: "Authorized redirect URIs"
2. Click: "+ ADD URI" or edit existing ones
3. Add this EXACT URL:
   ```
   https://wabiskills-seminar-1.onrender.com/api/auth/google/callback
   ```
4. Remove any old/incorrect URLs
5. Click: "SAVE" at the bottom

### 4. Wait for Changes
1. Google may take 5-10 minutes to apply changes
2. Try the login again after waiting

## Common Mistakes to Avoid
- ❌ `http://` instead of `https://`
- ❌ `wabiskills-seminar.onrender.com` (missing `-1`)
- ❌ `wabiskills-seminar-1.onrender.com/` (trailing slash)
- ❌ Any typos in the URL

## Test After Fix
1. Wait 5-10 minutes
2. Try Google login again
3. Should work without redirect_uri_mismatch error

## What I've Fixed
✅ Backend callback URL updated to correct deployed URL
✅ Frontend OAuth flow fixed
✅ Database schema updated with googleId field
✅ All code deployed and ready

The only remaining step is updating the Google Cloud Console setting.
