// "donationrequests" collection - someone asking for blood of a certain group.

const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema(
  {
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodGroupNeeded: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['pending', 'fulfilled'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
