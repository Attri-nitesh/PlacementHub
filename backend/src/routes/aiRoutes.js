const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeStudent } = require('../middleware/authMiddleware');
const aiRateLimiter = require('../middleware/aiRateLimiter');
const { analyzeAtsScore } = require('../controllers/aiController');

// All AI routes require authenticated student role
router.use(authenticateUser);

// ATS Match Score evaluation (Student only, rate-limited)
router.post('/analyze-ats', authorizeStudent, aiRateLimiter, analyzeAtsScore);

module.exports = router;
