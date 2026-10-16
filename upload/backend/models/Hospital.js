// "hospitals" collection - list of hospitals and blood banks.

const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    type: { type: String, enum: ['hospital', 'blood_bank'], default: 'hospital' },
    // Location fields drive the state -> district -> blood group availability
    // search. They are optional so older records keep working unchanged.
    city: { type: String, default: '', trim: true },
    district: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    availableBloodUnits: [
      {
        bloodGroup: String,
        units: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
