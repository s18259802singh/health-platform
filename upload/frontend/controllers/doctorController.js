// Handles: listing doctors, optionally filtered by hospital.

const Doctor = require('../models/Doctor');
const { rules, check, fail } = require('../utils/validate');

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
    const problems = check(req.body, {
      name: rules.text({ label: 'Doctor name', min: 3, max: 80 }),
      specialization: rules.text({ label: 'Speciality', min: 3, max: 60 }),
      hospitalId: rules.required('A hospital'),
    });
    if (Object.keys(problems).length) return fail(res, problems);

    const doctor = await Doctor.create({
      ...req.body,
      name: String(req.body.name).trim(),
      specialization: String(req.body.specialization).trim(),
    });
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDoctors, addDoctor };
