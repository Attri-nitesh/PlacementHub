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
    // AI Resume Intelligence Ingestion Fields
    parsedText: { type: String, default: '' },
    resumeHash: { type: String, default: '' },
    parsedAt: { type: Date },
    resumeVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
