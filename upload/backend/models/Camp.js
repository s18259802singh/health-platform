// "camps" collection - blood donation camps that organisations run and
// members register for. This is the module both reference platforms lead
// with, and the one that makes the site feel like a live service.

const mongoose = require('mongoose');

const campSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    organiser: { type: String, required: true, trim: true },
    venue: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: '', trim: true },
    date: { type: String, required: true },        // "2026-11-08"
    startTime: { type: String, default: '09:00 AM' },
    endTime: { type: String, default: '04:00 PM' },
    slots: { type: Number, default: 100 },         // capacity
    contactNumber: { type: String, default: '' },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },       // base64 data URL or remote URL
    // 'pending' is a camp somebody has APPLIED to run, not one that is
    // happening. It is created by the public application form and never
    // appears in a public listing until an administrator approves it.
    status: {
      type: String,
      enum: ['pending', 'upcoming', 'completed', 'cancelled', 'rejected'],
      default: 'upcoming',
    },
    // Who asked for it, and what they told us. Only set on applications.
    applicant: {
      name: { type: String, default: '', trim: true },
      organisation: { type: String, default: '', trim: true },
      email: { type: String, default: '', trim: true, lowercase: true },
      phone: { type: String, default: '', trim: true },
      expectedDonors: { type: Number, default: 0 },
      note: { type: String, default: '' },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      appliedAt: { type: Date },
    },
    // Why an application was turned down, so the console can say more than
    // "rejected" when somebody asks.
    reviewNote: { type: String, default: '' },
    // Members who signed up. Stored inline because a camp's list is small and
    // is always read together with the camp itself.
    registrations: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        phone: String,
        bloodGroup: String,
        registeredAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

campSchema.index({ date: 1, city: 1 });

// Handy derived value so the UI never has to count the array itself.
campSchema.virtual('slotsLeft').get(function slotsLeft() {
  return Math.max(0, (this.slots || 0) - (this.registrations?.length || 0));
});
campSchema.set('toJSON', { virtuals: true });
campSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Camp', campSchema);
