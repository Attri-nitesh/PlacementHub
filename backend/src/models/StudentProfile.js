const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  cgpa: {
    type: Number,
    required: [true, 'CGPA is required']
  },
  skills: {
    type: [String],
    default: []
  },
  education: [
    {
      degree: { type: String, required: true },
      institution: { type: String, required: true },
      passYear: { type: Number, required: true }
    }
  ],
  resumeUrl: {
    type: String,
    default: ''
  },
  contact: {
    type: String,
    trim: true
  },
  branch: {
    type: String,
    required: [true, 'Academic branch is required'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
