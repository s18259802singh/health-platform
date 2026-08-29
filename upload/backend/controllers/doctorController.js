// Handles: listing doctors, optionally filtered by hospital.

const Doctor = require('../models/Doctor');

// GET /api/doctors?hospitalId=
const getDoctors = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    const filter = hospitalId ? { hospitalId } : {};
    const doctors = await Doctor.find(filter).populate('hospitalId', 'name address');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/doctors (admin only)
const addDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDoctors, addDoctor };
