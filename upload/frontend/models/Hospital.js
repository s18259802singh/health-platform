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
    // Stock is held per blood group AND per component, because a ward
    // ringing round for platelets is not helped by a count of whole blood.
    // Rows written before components existed have no component field; they
    // are read as whole blood (see utils/components.js), so nothing that was
    // already in the database has to be migrated.
    availableBloodUnits: [
      {
        bloodGroup: String,
        component: {
          type: String,
          enum: ['whole', 'prbc', 'plasma', 'platelets'],
          default: 'whole',
        },
        units: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
