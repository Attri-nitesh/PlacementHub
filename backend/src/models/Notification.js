const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientRole: {
      type: String,
      enum: ['student', 'placement'],
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    senderRole: {
      type: String,
      enum: ['student', 'placement', 'system'],
      default: 'system',
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        'Success',
        'Warning',
        'Error',
        'Info',
        'System',
        'Interview',
        'Offer',
        'Application',
        'Announcement',
        'Drive',
      ],
      default: 'Info',
    },
    priority: {
      type: String,
      enum: ['Normal', 'High', 'Urgent'],
      default: 'Normal',
    },
    entityType: {
      type: String,
      enum: ['application', 'interview', 'offer', 'drive', 'announcement', 'profile', 'none'],
      default: 'none',
    },
    entityId: { type: String, trim: true },
    companyName: { type: String, trim: true },
    jobDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDrive' },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
    actionUrl: { type: String, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
