const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Centralized Notification Service with Deep Linking Support
 */
const createAndSendNotification = async (io, notifData) => {
  try {
    const notification = await Notification.create({
      recipient: notifData.recipient,
      recipientRole: notifData.recipientRole || 'student',
      sender: notifData.sender || null,
      senderRole: notifData.senderRole || 'system',
      title: notifData.title,
      message: notifData.message,
      type: notifData.type || 'Info',
      priority: notifData.priority || 'Normal',
      entityType: notifData.entityType || 'none',
      entityId: notifData.entityId || null,
      companyName: notifData.companyName || '',
      jobDrive: notifData.jobDrive || null,
      application: notifData.application || null,
      interview: notifData.interview || null,
      offer: notifData.offer || null,
      actionUrl: notifData.actionUrl || '',
      isRead: false,
    });

    if (io) {
      if (notifData.recipient) {
        io.to(`user:${notifData.recipient.toString()}`).emit('notification_received', notification);
      }
      if (notifData.recipientRole) {
        io.to(`role:${notifData.recipientRole}`).emit('role_notification_received', notification);
      }
    }

    return notification;
  } catch (error) {
    console.error('[NotificationService Error]', error);
    return null;
  }
};

/**
 * Broadcast Notification to All Users of a Specific Role
 */
const broadcastRoleNotification = async (io, recipientRole, notifData) => {
  try {
    const targetUsers = await User.find({ role: recipientRole }).select('_id');

    const notificationDocs = targetUsers.map((u) => ({
      recipient: u._id,
      recipientRole,
      sender: notifData.sender || null,
      senderRole: notifData.senderRole || 'system',
      title: notifData.title,
      message: notifData.message,
      type: notifData.type || 'Announcement',
      priority: notifData.priority || 'Normal',
      entityType: notifData.entityType || 'none',
      entityId: notifData.entityId || null,
      companyName: notifData.companyName || '',
      actionUrl: notifData.actionUrl || '',
      isRead: false,
    }));

    if (notificationDocs.length > 0) {
      await Notification.insertMany(notificationDocs);

      if (io) {
        io.to(`role:${recipientRole}`).emit('broadcast_notification', {
          title: notifData.title,
          message: notifData.message,
          type: notifData.type || 'Announcement',
          entityType: notifData.entityType,
          entityId: notifData.entityId,
          actionUrl: notifData.actionUrl,
          createdAt: new Date(),
        });
      }
    }
  } catch (error) {
    console.error('[BroadcastNotification Error]', error);
  }
};

module.exports = {
  createAndSendNotification,
  broadcastRoleNotification,
};
