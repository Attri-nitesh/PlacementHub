const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['Normal', 'High', 'Urgent'], default: 'Normal' },
    category: { type: String, enum: ['New Drive', 'Rescheduled', 'Notice', 'Update'], default: 'Notice' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
