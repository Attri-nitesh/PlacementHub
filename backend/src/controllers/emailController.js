const EmailConnection = require('../models/EmailConnection');
const ProcessedEmail = require('../models/ProcessedEmail');
const {
  generateAuthUrl,
  exchangeCodeForTokens,
  getGoogleUserInfo,
  revokeToken,
} = require('../services/googleOAuthService');
const {
  encryptToken,
  decryptToken,
  generateOAuthState,
  verifyOAuthState,
} = require('../utils/cryptoUtils');
const { syncUserGmail } = require('../services/gmailSyncService');

/**
 * @desc    Generate Google OAuth URL to Connect Gmail
 * @route   GET /api/email/google/connect
 * @access  Private
 */
const getGoogleConnectUrl = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to connect Gmail.',
      });
    }

    // Generate secure, short-lived OAuth state containing signed PlacementHub userId
    const stateToken = generateOAuthState(req.user._id);

    // Generate Google OAuth consent URL
    const authUrl = generateAuthUrl(stateToken);

    res.json({
      success: true,
      url: authUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Google OAuth Callback endpoint
 * @route   GET /api/email/google/callback
 * @access  Public (Validated via secure OAuth state token)
 */
const handleGoogleCallback = async (req, res, next) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const successRedirect = `${frontendUrl}/student/dashboard?tab=settings&gmail=connected`;
  const errorRedirect = `${frontendUrl}/student/dashboard?tab=settings&gmail=error`;

  try {
    const { code, state, error: googleError } = req.query;

    if (googleError) {
      console.warn('[Gmail OAuth Callback] Authorization declined by user:', googleError);
      return res.redirect(`${errorRedirect}&reason=user_cancelled`);
    }

    if (!code || !state) {
      console.warn('[Gmail OAuth Callback] Missing code or state parameter');
      return res.redirect(`${errorRedirect}&reason=invalid_params`);
    }

    // Validate secure OAuth state to prevent CSRF / account linking attacks
    const userId = verifyOAuthState(state);
    if (!userId) {
      console.warn('[Gmail OAuth Callback] Invalid or expired OAuth state token');
      return res.redirect(`${errorRedirect}&reason=invalid_state`);
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens || !tokens.access_token) {
      console.warn('[Gmail OAuth Callback] Failed to retrieve access token from Google');
      return res.redirect(`${errorRedirect}&reason=token_exchange_failed`);
    }

    // Retrieve user email profile from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token);
    if (!googleUser || !googleUser.email) {
      console.warn('[Gmail OAuth Callback] Could not determine Gmail email address');
      return res.redirect(`${errorRedirect}&reason=missing_email`);
    }

    // Encrypt tokens before storing in database
    const encryptedAccessToken = encryptToken(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? encryptToken(tokens.refresh_token)
      : null;

    const tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : null;
    const scopeArray = tokens.scope ? tokens.scope.split(' ') : ['https://www.googleapis.com/auth/gmail.readonly'];

    // Upsert EmailConnection for this PlacementHub user
    let connection = await EmailConnection.findOne({ user: userId });

    if (connection) {
      connection.provider = 'google';
      connection.email = googleUser.email.toLowerCase();
      connection.accessToken = encryptedAccessToken;
      // Preserve existing refresh token if Google does not return a new one during reconnection
      if (encryptedRefreshToken) {
        connection.refreshToken = encryptedRefreshToken;
      }
      connection.tokenExpiry = tokenExpiry;
      connection.scope = scopeArray;
      connection.connected = true;
      await connection.save();
    } else {
      connection = await EmailConnection.create({
        user: userId,
        provider: 'google',
        email: googleUser.email.toLowerCase(),
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry,
        scope: scopeArray,
        connected: true,
      });
    }

    console.log(`[Gmail Connection] Successfully connected ${googleUser.email} for PlacementHub user ${userId}`);
    return res.redirect(successRedirect);
  } catch (error) {
    console.error('[Gmail OAuth Callback Error]:', error.message);
    return res.redirect(errorRedirect);
  }
};

/**
 * @desc    Get Connected Gmail Status (Safe response, no tokens or secrets exposed)
 * @route   GET /api/email/status
 * @access  Private
 */
const getEmailStatus = async (req, res, next) => {
  try {
    const connection = await EmailConnection.findOne({
      user: req.user._id,
      connected: true,
    });

    if (!connection) {
      return res.json({
        success: true,
        connected: false,
      });
    }

    res.json({
      success: true,
      connected: true,
      provider: connection.provider || 'google',
      email: connection.email,
      lastSyncedAt: connection.lastSyncedAt || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger Manual / On-Demand Gmail Sync for authenticated PlacementHub user
 * @route   POST /api/email/sync
 * @access  Private
 */
const syncGmailEmails = async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const result = await syncUserGmail(req.user._id, io);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Development helper: Reset processed emails history for authenticated user
 * @route   DELETE /api/email/processed
 * @access  Private (Development mode)
 */
const clearProcessedEmails = async (req, res, next) => {
  try {
    const result = await ProcessedEmail.deleteMany({ user: req.user._id });
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} processed email history records for testing.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Disconnect Gmail Integration
 * @route   DELETE /api/email/google/disconnect
 * @access  Private
 */
const disconnectGoogleEmail = async (req, res, next) => {
  try {
    const connection = await EmailConnection.findOne({ user: req.user._id });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'No active Gmail connection found.',
      });
    }

    // Attempt to revoke refresh/access token at Google OAuth servers
    if (connection.refreshToken) {
      const plainRefreshToken = decryptToken(connection.refreshToken);
      if (plainRefreshToken) {
        await revokeToken(plainRefreshToken);
      }
    } else if (connection.accessToken) {
      const plainAccessToken = decryptToken(connection.accessToken);
      if (plainAccessToken) {
        await revokeToken(plainAccessToken);
      }
    }

    // Delete EmailConnection record from database
    await connection.deleteOne();

    console.log(`[Gmail Connection] Disconnected Gmail integration for user ${req.user._id}`);

    res.json({
      success: true,
      message: 'Gmail disconnected successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoogleConnectUrl,
  handleGoogleCallback,
  getEmailStatus,
  syncGmailEmails,
  clearProcessedEmails,
  disconnectGoogleEmail,
};
