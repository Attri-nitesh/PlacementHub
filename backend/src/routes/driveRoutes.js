const express = require('express');
const router = express.Router();
const { createDrive, getDrives, getDriveById, updateDrive, deleteDrive, applyToDrive } = require('../controllers/driveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { driveRules, validate } = require('../middleware/validation');

// Authenticated users only
router.use(protect);

router.get('/', getDrives);
router.get('/:id', getDriveById);

// Creation, updates, deletions reserved for admins & recruiters
router.post('/', authorize('admin', 'recruiter'), driveRules, validate, createDrive);
router.put('/:id', authorize('admin', 'recruiter'), driveRules, validate, updateDrive);
router.delete('/:id', authorize('admin', 'recruiter'), deleteDrive);

// Application to drive reserved for students
router.post('/:id/apply', authorize('student'), applyToDrive);

module.exports = router;
