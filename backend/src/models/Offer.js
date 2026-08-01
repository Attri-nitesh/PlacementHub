const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: { type: String, required: true },
    roleTitle: { type: String, required: true },
    packageLPA: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    offerLetterMessage: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
