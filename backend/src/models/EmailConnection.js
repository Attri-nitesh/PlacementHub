const mongoose = require('mongoose');

const emailConnectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      default: 'google',
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    tokenExpiry: {
      type: Date,
      default: null,
    },
    scope: {
      type: [String],
      default: [],
    },
    connected: {
      type: Boolean,
      default: true,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('EmailConnection', emailConnectionSchema);
