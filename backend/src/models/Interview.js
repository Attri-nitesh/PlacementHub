const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: { type: String, required: true },
    roleTitle: { type: String, required: true },
    round: { type: String, required: true, default: 'Technical Round 1' },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    type: { type: String, enum: ['Online', 'Offline'], default: 'Online' },
    meetLink: { type: String, trim: true },
    venue: { type: String, trim: true },
    instructions: { type: String, trim: true },
    interviewerName: { type: String, trim: true },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
