const mongoose = require('mongoose');

const PlacementDriveSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  jobRole: {
    type: String,
    required: [true, 'Job role is required'],
    trim: true
  },
  package: {
    type: Number,
    required: [true, 'Package (LPA) is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  eligibilityCgpa: {
    type: Number,
    required: [true, 'Eligibility CGPA is required'],
    default: 0
  },
  deadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  createdByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PlacementDrive', PlacementDriveSchema);
