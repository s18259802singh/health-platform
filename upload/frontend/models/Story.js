// "stories" collection - short donor and recipient stories.
// These are what give the public site its warmth; the admin writes them and
// they render as an editorial card wall.

const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['donor', 'recipient', 'organiser'], default: 'donor' },
    bloodGroup: { type: String, default: '' },
    city: { type: String, default: '' },
    headline: { type: String, required: true, trim: true },
    body: { type: String, required: true },     // blank line between paragraphs
    imageUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Story', storySchema);
