const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getApplicantsForDrive, updateApplicantStatus } = require('../controllers/recruiterController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { recruiterProfileRules, validate } = require('../middleware/validation');

// Protect all recruiter endpoints
router.use(protect);
router.use(authorize('recruiter'));

router.get('/profile', getProfile);
router.put('/profile', recruiterProfileRules, validate, updateProfile);
router.get('/applicants/:driveId', getApplicantsForDrive);
router.put('/applicants/:applicationId', updateApplicantStatus);

module.exports = router;
