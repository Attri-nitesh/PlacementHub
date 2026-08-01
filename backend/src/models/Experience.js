const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Internship', 'Volunteer', 'Freelancing', 'Full Time'],
      default: 'Internship',
    },
    duration: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Experience', experienceSchema);
