const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// @desc    Get all notifications for logged-in user (including general broadcasts)
// @route   GET /api/notifications
// @access  Protected
router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipient: req.user.id },
        { recipient: null }
      ]
    }).sort({ createdAt: -1 }).limit(50);

    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Protected
router.put('/:id/read', async (req, res, next) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Verify it is their notification
    if (notif.recipient && notif.recipient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to read this notification' });
    }

    notif.read = true;
    await notif.save();

    res.status(200).json({ success: true, data: notif });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
