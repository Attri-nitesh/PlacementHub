const mongoose = require('mongoose');

const processedEmailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emailConnection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmailConnection',
      required: true,
    },
    gmailMessageId: {
      type: String,
      required: true,
    },
    gmailThreadId: {
      type: String,
    },
    sender: {
      type: String,
      default: '',
    },
    senderEmail: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      default: '',
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
    eventType: {
      type: String,
      enum: [
        'APPLIED',
        'ONLINE_ASSESSMENT',
        'SHORTLISTED',
        'INTERVIEW',
        'OFFER',
        'REJECTED',
        'UNKNOWN',
      ],
      default: 'UNKNOWN',
    },
    confidence: {
      type: Number,
      default: 0,
    },
    company: {
      type: String,
      default: '',
    },
    jobTitle: {
      type: String,
      default: '',
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null,
    },
    action: {
      type: String,
      enum: ['CREATED_APPLICATION', 'UPDATED_APPLICATION', 'PENDING_REVIEW', 'IGNORED'],
      required: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound unique index ensuring each Gmail message is processed exactly once per user
processedEmailSchema.index({ user: 1, gmailMessageId: 1 }, { unique: true });

module.exports = mongoose.model('ProcessedEmail', processedEmailSchema);
