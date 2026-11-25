// "guides" collection - the donor education library, grouped into the five
// categories a donor moves through: education, eligibility, preparation,
// recovery, and staying a regular donor.

const mongoose = require('mongoose');

const CATEGORIES = ['education', 'eligibility', 'preparation', 'recovery', 'regular'];

const guideSchema = new mongoose.Schema(
  {
    category: { type: String, enum: CATEGORIES, required: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    readMinutes: { type: Number, default: 3 },
    order: { type: Number, default: 0 },        // controls position within a category
  },
  { timestamps: true }
);

guideSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Guide', guideSchema);
