const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  stage: { type: String, required: true },
  date: { type: Date, default: Date.now },
  remarks: { type: String },
  updatedBy: { type: String, default: 'Placement Cell' },
});

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobDrive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDrive',
    },
    companyName: { type: String, required: true },
    companyLogo: { type: String },
    roleTitle: { type: String, required: true },
    packageLPA: { type: String, required: true },
    location: { type: String, required: true },
    deadline: { type: Date },
    appliedDate: { type: Date, default: Date.now },
    stage: {
      type: String,
      enum: [
        'Applied',
        'Resume Shortlisted',
        'OA',
        'Interview',
        'Selected',
        'Offer Released',
        'Rejected',
      ],
      default: 'Applied',
    },
    timeline: [timelineSchema],
    rejectionReason: { type: String },
    rejectionFeedback: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
