const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementDrive',
    required: true
  },
  platform: {
    type: String,
    default: 'PlacementHub'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Applied', 'Online Assessment', 'Interview', 'Offer', 'Rejected'],
    default: 'Applied'
  },
  resumeUrl: {
    type: String
  },
  feedback: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Avoid duplicate applications by a student to the same drive
ApplicationSchema.index({ student: 1, drive: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
