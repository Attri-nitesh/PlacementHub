const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'Programming Languages',
        'Frameworks',
        'Databases',
        'Tools',
        'Cloud',
        'Soft Skills',
      ],
      default: 'Programming Languages',
    },
    proficiency: { type: Number, min: 1, max: 100, default: 80 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
