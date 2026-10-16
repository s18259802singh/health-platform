// "donations" collection - a confirmed unit of blood given by a member.
// This is the record that powers the donor leaderboard and the downloadable
// certificate. Only an administrator can create one, so the leaderboard
// cannot be gamed by members claiming donations themselves.

const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donatedAt: { type: Date, required: true },
    bloodGroup: { type: String, required: true },
    units: { type: Number, default: 1, min: 1 },
    // Where it happened - either a listed hospital/blood bank, a camp, or free text.
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    campId: { type: mongoose.Schema.Types.ObjectId, ref: 'Camp' },
    locationName: { type: String, default: '' },
    certificateNo: { type: String, unique: true, sparse: true },

    // CERTIFICATES ARE ISSUED, NOT AUTOMATIC.
    // The reference number is reserved when the record is created, but the
    // certificate itself is not valid until an administrator issues it. A
    // certificate is a document a centre stands behind - it should not be
    // downloadable the instant a row lands in the database.
    certificateIssued: { type: Boolean, default: false },
    certificateIssuedAt: { type: Date },
    certificateIssuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

donationSchema.index({ userId: 1, donatedAt: -1 });

// A stable, human-readable certificate reference, generated once on create.
donationSchema.pre('save', function setCertificateNo(next) {
  if (!this.certificateNo) {
    const stamp = new Date(this.donatedAt || Date.now());
    const y = stamp.getFullYear();
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    this.certificateNo = `LL-${y}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Donation', donationSchema);
