# Google OAuth Setup Instructions

## Current Status
- ✅ Client ID extracted correctly: `858512081839-tm1ch5o851jlpqukmkkcf3ql5fium9qo.apps.googleusercontent.com`
- ✅ Redirect URI configured: `https://f9113c29-9190-4118-87e1-0a55c80c4586-00-3m225c43n2uac.worf.replit.dev/api/auth/google/callback`
- ❌ JavaScript Origins not configured (causing "refused to connect" error)

## Required Google Cloud Console Configuration

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Navigate to: APIs & Services → Credentials
3. Find your OAuth 2.0 Client ID: `858512081839-tm1ch5o851jlpqukmkkcf3ql5fium9qo.apps.googleusercontent.com`

### Step 2: Add Authorized JavaScript Origins
Add this exact URL to **Authorized JavaScript origins**:
```
https://f9113c29-9190-4118-87e1-0a55c80c4586-00-3m225c43n2uac.worf.replit.dev
```

### Step 3: Verify Authorized Redirect URIs
Ensure this URL is in **Authorized redirect URIs**:
```
https://f9113c29-9190-4118-87e1-0a55c80c4586-00-3m225c43n2uac.worf.replit.dev/api/auth/google/callback
```

### Step 4: Save Changes
Click "Save" and wait 5-10 minutes for changes to propagate.

## Testing
After saving changes, try the "Sign in with Google" button on the Toodles website.

## Troubleshooting
- If still getting 403 errors, wait longer for Google's servers to update
- Double-check that both JavaScript origins AND redirect URIs are set
- Ensure no typos in the URLs (they must match exactly)