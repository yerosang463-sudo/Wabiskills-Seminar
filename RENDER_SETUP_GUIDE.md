# Render Configuration Guide for WabiSeminar

## 🎯 Objective
Fix OAuth flow and room redirects so users can open invite links → sign in → stay on the correct room page without "Not Found" errors.

## 📋 Required Actions on Render

### 1. Backend Service Environment Variables

Go to your **backend service** on Render → Settings → Environment

**Set these environment variables:**

```
CORS_ORIGIN=https://wabiskills-seminar-1.onrender.com,https://wabiskills-seminar.onrender.com
PUBLIC_APP_URL=https://wabiskills-seminar-1.onrender.com
```

**Important:**
- Replace `wabiskills-seminar-1` with your actual frontend hostname if different
- The first URL should be your primary frontend URL (where invite links point)
- Add secondary URLs separated by commas if needed
- `PUBLIC_APP_URL` should match the first CORS URL exactly

### 2. Frontend Service Redirects

Go to your **frontend service** on Render → Settings → Redirects/Rewrites

**Add this rewrite rule:**

```
Type: Rewrite
Source: /*
Destination: /index.html
```

**Important:**
- Choose "Rewrite" (NOT Redirect)
- This ensures SPA routing works for /room/:id URLs
- The dist/404.html and publicUrl logic will handle the rest

### 3. Deploy Changes

After setting the environment variables and redirects:

1. **Backend**: Click "Manual Deploy" → "Deploy Latest Commit"
2. **Frontend**: Click "Manual Deploy" → "Deploy Latest Commit"
3. Wait for both services to finish deploying (2-3 minutes each)

## 🔄 Expected Flow After Setup

1. **User opens invite link**: `https://wabiskills-seminar-1.onrender.com/room/abc-defg-hij`
2. **Not logged in**: Redirects to auth page
3. **Clicks "Google" login**: OAuth flow preserves room path
4. **After OAuth**: Returns to `/room/abc-defg-hij` with token
5. **User joins meeting**: No "Not Found" errors

## 🔍 What This Fixes

### Before (Broken):
- Open `/room/abc-defg-hij` → "Not Found" page
- OAuth redirects to `/` (loses room context)
- Manual navigation required after login

### After (Fixed):
- Open `/room/abc-defg-hij` → Shows auth page
- OAuth preserves room path via cookies
- Auto-redirect back to room after login
- Seamless user experience

## 🛠️ Technical Details

### Backend Changes Made:
- `getPublicAppOrigin()` uses `PUBLIC_APP_URL` for redirects
- OAuth stores `returnTo` path in secure cookie
- Callback reads cookie and redirects to original room

### Frontend Changes Made:
- `handleGoogleLogin()` includes current path in OAuth request
- Auth component handles token and username from URL params
- SPA routing works with rewrite rule

## ✅ Verification Steps

1. **Test direct room URL**: Open `/room/test-123-456` - should show auth page
2. **Test Google OAuth**: Click Google login - should return to room
3. **Test email login**: Register/login - should redirect to room
4. **Test invalid URLs**: Random paths should show 404/not found

## 🚨 Troubleshooting

If still getting "Not Found":
1. Check frontend rewrite rule is set correctly
2. Verify `PUBLIC_APP_URL` matches frontend hostname
3. Ensure both services are fully deployed
4. Clear browser cache and test again

If OAuth doesn't redirect to room:
1. Check `CORS_ORIGIN` includes frontend URL
2. Verify cookies are being set (check browser dev tools)
3. Ensure `PUBLIC_APP_URL` is set correctly

## 📝 Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `CORS_ORIGIN` | Allowed origins for API | `https://wabiskills-seminar-1.onrender.com,https://wabiskills-seminar.onrender.com` |
| `PUBLIC_APP_URL` | Base URL for OAuth redirects | `https://wabiskills-seminar-1.onrender.com` |
| `GOOGLE_CALLBACK_URL` | OAuth callback (already set) | `https://wabiskills-seminar-1.onrender.com/api/auth/google/callback` |

## 🎯 Success Criteria

✅ Users can open room invite links directly  
✅ OAuth login preserves room context  
✅ No "Not Found" errors on valid room URLs  
✅ Seamless login-to-room flow  
✅ Proper CORS and cookie handling  

After completing these steps, your WabiSeminar application will have a professional, seamless user experience for room invites and authentication!
