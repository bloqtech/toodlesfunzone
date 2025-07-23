import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Extract Client ID from URL format if needed
function extractClientId(rawClientId: string | undefined): string | undefined {
  if (!rawClientId) return undefined;
  
  // If it starts with https://, extract the client ID from the URL
  if (rawClientId.startsWith('https://')) {
    // Extract the client ID from URLs like: https://858512081639-tm1sb5831jgoqamke43gf38fumqp.apps.googleusercontent.com
    const match = rawClientId.match(/https:\/\/([^\/]+)/);
    return match ? match[1] : rawClientId;
  }
  
  return rawClientId;
}

const CLIENT_ID = extractClientId(process.env.GOOGLE_CLIENT_ID);
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Use current domain from REPLIT_DOMAINS or fallback to localhost
function getRedirectUri(): string {
  if (process.env.REPLIT_DOMAINS) {
    const domain = process.env.REPLIT_DOMAINS.split(',')[0];
    return `https://${domain}/api/auth/google/callback`;
  }
  return process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
}

const REDIRECT_URI = getRedirectUri();

export const oauth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Generate Google OAuth URL
export function getGoogleAuthUrl(): string {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  console.log('OAuth2Client redirect URI:', REDIRECT_URI);
  console.log('OAuth2Client configured with Client ID:', CLIENT_ID);
  console.log('Raw CLIENT_ID from env:', process.env.GOOGLE_CLIENT_ID?.substring(0, 50) + '...');
  console.log('Extracted CLIENT_ID:', CLIENT_ID);

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'select_account'
  });
}

// Exchange authorization code for tokens
export async function getGoogleUserInfo(code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2('v2');

    const { data } = await oauth2.userinfo.get();
    
    return {
      id: data.id,
      email: data.email,
      firstName: data.given_name,
      lastName: data.family_name,
      profileImageUrl: data.picture,
      tokens
    };
  } catch (error) {
    console.error('Error getting Google user info:', error);
    throw new Error('Failed to authenticate with Google');
  }
}

// Verify Google ID token
export async function verifyGoogleToken(idToken: string) {
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    return {
      id: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      profileImageUrl: payload.picture,
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
}