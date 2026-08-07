const { google } = require('googleapis');

/**
 * Creates an instance of Google OAuth2 client configured with env variables
 */
const getOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    'http://localhost:5001/api/email/google/callback';

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth Client Credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are missing from environment configuration');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

/**
 * Generate Google OAuth authorization URL for Gmail read-only access
 */
const generateAuthUrl = (stateToken) => {
  const oauth2Client = getOAuth2Client();

  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'openid',
    'email',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Forces Google to issue a refresh token
    scope: scopes,
    state: stateToken,
  });
};

/**
 * Exchange OAuth authorization code for Access & Refresh Tokens
 */
const exchangeCodeForTokens = async (code) => {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

/**
 * Get connected Google account email profile using access token
 */
const getGoogleUserInfo = async (accessToken) => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userinfo = await oauth2.userinfo.get();
  return userinfo.data;
};

/**
 * Revoke Google OAuth token upon disconnect
 */
const revokeToken = async (token) => {
  if (!token) return;
  try {
    const oauth2Client = getOAuth2Client();
    await oauth2Client.revokeToken(token);
  } catch (err) {
    console.warn('[Google OAuth Service] Token revocation notice:', err.message);
  }
};

module.exports = {
  getOAuth2Client,
  generateAuthUrl,
  exchangeCodeForTokens,
  getGoogleUserInfo,
  revokeToken,
};
