const express = require('express');
const router = express.Router();
const {
  getGoogleConnectUrl,
  handleGoogleCallback,
  getEmailStatus,
  syncGmailEmails,
  clearProcessedEmails,
  disconnectGoogleEmail,
} = require('../controllers/emailController');
const { authenticateUser } = require('../middleware/authMiddleware');

// OAuth Callback route (Public - validated via signed OAuth state token)
router.get('/google/callback', handleGoogleCallback);

// Authenticated Routes
router.get('/google/connect', authenticateUser, getGoogleConnectUrl);
router.get('/status', authenticateUser, getEmailStatus);
router.post('/sync', authenticateUser, syncGmailEmails);
router.delete('/processed', authenticateUser, clearProcessedEmails);
router.delete('/google/disconnect', authenticateUser, disconnectGoogleEmail);

module.exports = router;
