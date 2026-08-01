const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, default: 'application/pdf' },
    status: {
      type: String,
      enum: ['Verified', 'Pending', 'Action Needed'],
      default: 'Verified',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
