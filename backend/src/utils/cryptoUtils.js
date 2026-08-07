const crypto = require('crypto');

// Derive 32-byte encryption key for AES-256-GCM
const getEncryptionKey = () => {
  const secret =
    process.env.EMAIL_TOKEN_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    'placementhub_default_token_encryption_key_2026';
  return crypto.createHash('sha256').update(secret).digest();
};

/**
 * Encrypt sensitive string (e.g. OAuth access / refresh tokens) using AES-256-GCM
 */
const encryptToken = (text) => {
  if (!text) return null;
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('[CryptoUtils] Token encryption failed:', err.message);
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypt token string encrypted with AES-256-GCM
 */
const decryptToken = (encryptedText) => {
  if (!encryptedText) return null;
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText; // Fallback if plain text
    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[CryptoUtils] Token decryption failed:', err.message);
    return null;
  }
};

/**
 * Generate a cryptographically secure, signed OAuth State token containing PlacementHub userId
 * State expires in 15 minutes to prevent CSRF / account linking attacks.
 */
const generateOAuthState = (userId) => {
  const payload = {
    userId: userId.toString(),
    ts: Date.now(),
    nonce: crypto.randomBytes(8).toString('hex'),
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.JWT_SECRET || 'placementhub_jwt_super_secret_key_2026_phase1';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64url');
  return `${payloadBase64}.${signature}`;
};

/**
 * Validate OAuth state token and extract verified userId
 */
const verifyOAuthState = (stateString) => {
  if (!stateString || typeof stateString !== 'string') return null;
  const parts = stateString.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;
  const secret = process.env.JWT_SECRET || 'placementhub_jwt_super_secret_key_2026_phase1';
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64url');

  if (signature !== expectedSignature) {
    console.warn('[OAuth State] Invalid state signature detected');
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    // State expires after 15 minutes (900,000 ms)
    const MAX_AGE_MS = 15 * 60 * 1000;
    if (!payload.ts || Date.now() - payload.ts > MAX_AGE_MS) {
      console.warn('[OAuth State] OAuth state token expired');
      return null;
    }
    return payload.userId;
  } catch (err) {
    return null;
  }
};

module.exports = {
  encryptToken,
  decryptToken,
  generateOAuthState,
  verifyOAuthState,
};
