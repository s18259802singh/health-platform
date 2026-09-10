// "donationrequests" collection - someone asking for blood of a certain group.

const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema(
  {
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodGroupNeeded: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['pending', 'fulfilled'], default: 'pending' },
    // Donors who tapped "I can donate" on this request. The requester sees
    // their names and numbers, so the loop closes inside the platform.
    responders: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        phone: String,
        bloodGroup: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
