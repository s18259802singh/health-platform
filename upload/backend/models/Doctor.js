// "doctors" collection - each doctor belongs to one hospital (hospitalId is a reference).

const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    availableDays: [{ type: String }], // e.g. ["Monday", "Wednesday", "Friday"]
    availableTimeSlots: [{ type: String }], // e.g. ["10:00 AM", "11:00 AM"]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
