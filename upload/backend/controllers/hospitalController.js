// Handles: full CRUD for hospitals / blood banks.
// Create, Update, Delete are admin-only (protected by adminOnly middleware on the route).
// Read (list + search) is open to any logged-in user.

const Hospital = require('../models/Hospital');

// GET /api/hospitals?search=
const getHospitals = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { address: { $regex: search, $options: 'i' } }] }
      : {};
    const hospitals = await Hospital.find(filter).sort({ name: 1 });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/hospitals (admin only)
const addHospital = async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/hospitals/:id (admin only)
const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/hospitals/:id (admin only)
const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.json({ message: 'Hospital deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getHospitals, addHospital, updateHospital, deleteHospital };
