// This is the "users" collection.
// Every registered person (donor, patient, or admin) is stored here.

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // stored as a bcrypt hash, never plain text
    phone: { type: String, required: true },
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    allergies: { type: String, default: 'None' },
    emergencyContact: {
      name: { type: String, required: true },
      number: { type: String, required: true },
    },
    isDonor: { type: Boolean, default: false },
    location: { type: String, default: '' }, // city/area, used for donor search
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    qrCodePath: { type: String, default: '' }, // where the generated QR image is saved
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('User', userSchema);
