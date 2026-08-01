const mongoose = require('mongoose');

const jobDriveSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    companyName: { type: String, required: true, trim: true },
    companyLogo: { type: String, trim: true },
    roleTitle: { type: String, required: true, trim: true },
    packageLPA: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true },
    type: { type: String, enum: ['Full Time', 'Internship', 'Both'], default: 'Full Time' },
    eligibilityCGPA: { type: Number, default: 7.0 },
    description: { type: String, required: true },
    skillsRequired: [{ type: String, trim: true }],
    selectionProcess: [{ type: String, trim: true }],

    // Enterprise Lifecycle Management
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Closed', 'Archived'],
      default: 'Draft',
    },

    publishedAt: { type: Date },
    closedAt: { type: Date },
    archivedAt: { type: Date },

    publishedBy: { type: String, default: 'Placement Cell' },
    closedBy: { type: String },
    archivedBy: { type: String },

    closeReason: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobDrive', jobDriveSchema);
