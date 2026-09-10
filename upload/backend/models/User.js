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
    // OPTIONAL health details for the emergency page. All optional - the user
    // chooses what to share, since anyone who scans the QR can see this.
    heightCm: { type: Number, default: null },   // e.g. 172
    weightKg: { type: Number, default: null },   // matters for drug dosing
    medicalConditions: { type: String, default: '' }, // e.g. "Diabetes (type 2), High BP, Thyroid"
    medications: { type: String, default: '' },       // e.g. "Metformin, Amlodipine"

    location: { type: String, default: '' }, // city/area, used for donor search
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    qrCodePath: { type: String, default: '' }, // where the generated QR image is saved
    // Every time someone opens this user's public emergency page (i.e. scans
    // their QR), we log the moment. The user sees this on their profile -
    // "know when your medical info was accessed". Only the last 20 are kept.
    qrScans: [{ type: Date }],
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('User', userSchema);
