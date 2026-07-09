const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getApplications } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { studentProfileRules, validate } = require('../middleware/validation');

// All student routes require authentication and 'student' role
router.use(protect);
router.use(authorize('student'));

router.get('/profile', getProfile);
router.put('/profile', studentProfileRules, validate, updateProfile);
router.get('/applications', getApplications);

module.exports = router;
