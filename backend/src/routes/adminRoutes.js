const express = require('express');
const router = express.Router();
const { getAllApplicants, approveOrRejectApplication, sendNotification } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Protect all admin endpoints
router.use(protect);
router.use(authorize('admin'));

router.get('/applicants', getAllApplicants);
router.put('/applications/:id/approve', approveOrRejectApplication);
router.post('/notifications', sendNotification);

module.exports = router;
