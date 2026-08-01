const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    technologies: [{ type: String, trim: true }],
    githubLink: { type: String, trim: true },
    liveLink: { type: String, trim: true },
    projectImage: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
