// Handles: full CRUD for hospitals / blood banks.
// Create, Update, Delete are admin-only (protected by adminOnly middleware on the route).
// Read (list + search) is open to any logged-in user.

const Hospital = require('../models/Hospital');
const { rules, check, fail } = require('../utils/validate');

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
// The shape a centre has to have, whichever endpoint writes it. Passing
// req.body straight to Mongoose let a record in with an empty name and a
// phone number that was not one, and the directory is only as good as the
// worst row in it.
const centreSchema = {
  name: rules.text({ label: 'Centre name', min: 3, max: 140 }),
  address: rules.text({ label: 'Address', min: 6, max: 240 }),
  contactNumber: rules.optional(rules.anyPhone),
  type: rules.oneOf(['hospital', 'blood_bank'], 'Centre type'),
  city: rules.optional(rules.place),
  district: rules.optional(rules.text({ label: 'District', max: 80 })),
  state: rules.optional(rules.text({ label: 'State', max: 80 })),
};

// Units are a nested array, so they are checked separately and reported
// against the field the form actually shows.
const unitProblems = (units) => {
  if (units === undefined) return '';
  if (!Array.isArray(units)) return 'Stock must be a list of blood groups';
  for (const row of units) {
    const n = Number(row?.units);
    if (!Number.isFinite(n) || n < 0 || n > 9999 || n % 1 !== 0) {
      return `Units for ${row?.bloodGroup || 'a blood group'} must be a whole number between 0 and 9999`;
    }
  }
  return '';
};

const addHospital = async (req, res) => {
  try {
    const problems = check(req.body, centreSchema);
    const unitsMsg = unitProblems(req.body.availableBloodUnits);
    if (unitsMsg) problems.availableBloodUnits = unitsMsg;
    if (Object.keys(problems).length) return fail(res, problems);

    const hospital = await Hospital.create({
      ...req.body,
      name: String(req.body.name).trim(),
      address: String(req.body.address).trim(),
      contactNumber: String(req.body.contactNumber || '').trim() || 'N/A',
    });
    res.status(201).json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/hospitals/:id (admin only)
const updateHospital = async (req, res) => {
  try {
    // Only the keys actually sent are checked, so a partial update - a stock
    // correction, say - is not rejected for lacking an address.
    const present = Object.fromEntries(
      Object.entries(centreSchema).filter(([k]) => req.body[k] !== undefined));
    const problems = check(req.body, present);
    const unitsMsg = unitProblems(req.body.availableBloodUnits);
    if (unitsMsg) problems.availableBloodUnits = unitsMsg;
    if (Object.keys(problems).length) return fail(res, problems);

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
