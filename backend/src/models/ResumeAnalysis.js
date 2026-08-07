const mongoose = require('mongoose');

const atsAnalysisSectionSchema = new mongoose.Schema({
  overallScore: { type: Number, required: true },
  scoreCategory: {
    type: String,
    enum: ['High Match', 'Moderate Match', 'Low Match'],
    required: true,
  },
  technicalSkillsScore: { type: Number, required: true },
  projectsExperienceScore: { type: Number, required: true },
  resumeStructureScore: { type: Number, required: true },
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

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobDrive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDrive',
      required: true,
    },
    schemaVersion: { type: String, default: '1.0' },
    resumeHash: { type: String, required: true },
    resumeVersion: { type: Number, default: 1 },
    
    // Centralized AI Intelligence Sections
    atsAnalysis: atsAnalysisSectionSchema,
  },
  { timestamps: true }
);

// Compound unique index per user & job drive
resumeAnalysisSchema.index({ user: 1, jobDrive: 1 }, { unique: true });

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
