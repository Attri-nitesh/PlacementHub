const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Personal Information
    phone: { type: String, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    address: { type: String, trim: true },

    // Academic Information
    registrationNumber: { type: String, trim: true },
    department: { type: String, trim: true, default: 'Computer Science & Engineering' },
    branch: { type: String, trim: true, default: 'Computer Science' },
    semester: { type: Number, min: 1, max: 10, default: 7 },
    cgpa: { type: Number, min: 0, max: 10, default: 8.5 },
    backlogs: { type: Number, default: 0 },

    // Professional / Coding Profiles
    codingProfiles: {
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      leetcode: { type: String, trim: true },
      codechef: { type: String, trim: true },
      codeforces: { type: String, trim: true },
      portfolio: { type: String, trim: true },
    },

    // Career Information
    preferredRoles: [{ type: String, trim: true }],
    preferredLocations: [{ type: String, trim: true }],
    expectedPackage: { type: String, trim: true },
    workType: { type: String, enum: ['Full Time', 'Internship', 'Both'], default: 'Full Time' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
