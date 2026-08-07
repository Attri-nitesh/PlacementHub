const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for AI Resume Intelligence endpoints
 * Restricts each user/IP to max 10 requests per 15-minute window.
 */
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  },
  message: {
    success: false,
    message: 'Too many AI ATS analysis requests. Please wait 15 minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = aiRateLimiter;
