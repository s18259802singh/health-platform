// "hospitals" collection - list of hospitals and blood banks.

const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    type: { type: String, enum: ['hospital', 'blood_bank'], default: 'hospital' },
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
