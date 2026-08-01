const Notification = require('../models/Notification');

// @desc    Get user notifications with filtering & pagination
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res, next) => {
  try {
    const { type, unreadOnly, search, page = 1, limit = 30 } = req.query;

    let query = { recipient: req.user._id };

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    res.status(200).json({
      success: true,
      notifications,
      total,
      unreadCount,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Unread Notification Count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.status(200).json({ success: true, notification, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, unreadCount: 0, message: 'All notifications marked read.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.status(200).json({ success: true, unreadCount, message: 'Notification deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all user notifications
// @route   DELETE /api/notifications/all
// @access  Private
const deleteAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.status(200).json({ success: true, unreadCount: 0, message: 'All notifications cleared.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
};
