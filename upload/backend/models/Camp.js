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
    status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
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
