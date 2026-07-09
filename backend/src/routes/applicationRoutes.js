const express = require('express');
const router = express.Router();
const { updateApplicationStatus } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Status updates (both students and recruiters/admins can hit with built-in auth checks)
router.put('/:id/status', updateApplicationStatus);

module.exports = router;
