const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    credentialLink: { type: String, trim: true },
    certificateImage: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certification', certificationSchema);
