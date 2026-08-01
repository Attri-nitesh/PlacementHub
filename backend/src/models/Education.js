const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    level: {
      type: String,
      enum: ['10th', '12th', 'Diploma', 'College'],
      required: true,
    },
    institute: { type: String, required: true, trim: true },
    board: { type: String, trim: true }, // Board or University
    passingYear: { type: Number, required: true },
    percentage: { type: Number, min: 0, max: 100 },
    cgpa: { type: Number, min: 0, max: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Education', educationSchema);
