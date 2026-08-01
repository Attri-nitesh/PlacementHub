const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const {
  getUserNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
} = require('../controllers/notificationController');

// Require authentication for all notification routes
router.use(authenticateUser);

router.route('/').get(getUserNotifications);
router.route('/unread-count').get(getUnreadCount);
router.route('/read-all').put(markAllNotificationsRead);
router.route('/all').delete(deleteAllNotifications);
router.route('/:id/read').put(markNotificationRead);
router.route('/:id').delete(deleteNotification);

module.exports = router;
