const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  stage: { type: String, required: true },
  date: { type: Date, default: Date.now },
  remarks: { type: String },
  updatedBy: { type: String, default: 'Placement Cell' },
});

const atsAnalysisSubSchema = new mongoose.Schema({
  schemaVersion: { type: String, default: '1.0' },
  resumeHash: { type: String },
  resumeVersion: { type: Number, default: 1 },
  overallScore: { type: Number, default: 0 },
  scoreCategory: {
    type: String,
    enum: ['High Match', 'Moderate Match', 'Low Match'],
  },
  technicalSkillsScore: { type: Number, default: 0 },
  projectsExperienceScore: { type: Number, default: 0 },
  resumeStructureScore: { type: Number, default: 0 },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  suggestions: [{ type: String }],
  analysisSource: {
    type: String,
    enum: ['LLM_Gemini', 'Heuristic_Engine'],
    default: 'LLM_Gemini',
  },
  confidence: { type: Number, default: 1.0 },
  analyzedAt: { type: Date, default: Date.now },
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
    packageLPA: { type: String, required: true, default: 'N/A' },
    location: { type: String, required: true, default: 'Remote / Flexible' },
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
    // AI Resume Intelligence Embedded Snapshot
    atsAnalysis: atsAnalysisSubSchema,
    // Phase 2: Gmail Tracking Integration metadata
    autoTracked: { type: Boolean, default: false },
    trackingSource: { type: String, default: null }, // e.g. "gmail"
    externalAppId: { type: String, default: null }, // extracted application/req ID
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
