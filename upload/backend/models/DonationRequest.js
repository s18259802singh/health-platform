// "donationrequests" collection - someone asking for blood of a certain group.

const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema(
  {
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodGroupNeeded: { type: String, required: true },
    location: { type: String, required: true },
    // How many units the patient needs, and where. Both shown on the board so
    // a donor can judge whether they can help before ringing anybody.
    unitsNeeded: { type: Number, default: 1, min: 1, max: 20 },
    hospital: { type: String, default: '', trim: true },
    note: { type: String, default: '', trim: true, maxlength: 300 },
    urgency: { type: String, enum: ['routine', 'urgent', 'critical'], default: 'urgent' },

    status: { type: String, enum: ['pending', 'fulfilled', 'cancelled'], default: 'pending' },

    // When it was closed, either way. createdAt is the date it was raised;
    // these two say when it stopped being somebody's problem, which is what
    // the board and the console both need to show.
    fulfilledAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
