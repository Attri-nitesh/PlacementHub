const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    logo: { type: String, trim: true },
    description: { type: String, trim: true },
    website: { type: String, trim: true },
    industry: { type: String, required: true, trim: true, default: 'Information Technology' },
    hrName: { type: String, required: true, trim: true },
    hrEmail: { type: String, required: true, lowercase: true, trim: true },
    hrPhone: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Active', 'Archived'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
