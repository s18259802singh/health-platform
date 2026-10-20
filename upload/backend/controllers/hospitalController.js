// Handles: full CRUD for hospitals / blood banks.
// Create, Update, Delete are admin-only (protected by adminOnly middleware on the route).
// Read (list + search) is open to any logged-in user.

const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const DonationRequest = require('../models/DonationRequest');
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

// GET /api/hospitals/:id
//
// ONE CENTRE, AND EVERYTHING ABOUT IT. The directory row used to be a dead
// end: you could read a name, a phone number and eight stock figures squeezed
// into one cell, and that was the whole of it. This backs a page per centre -
// its stock in full, the doctors who hold clinics there, and the open blood
// requests nearby that it could answer.
//
// Public, like /api/availability, because the centre's name, address and
// recorded stock are public information and somebody looking for blood at
// 3am should not have to sign in to read it. The doctor list is only attached
// for a signed-in member, since that is where it lives everywhere else.
const getHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Centre not found' });

    const doctors = req.user
      ? await Doctor.find({ hospitalId: hospital._id }).select('name specialization availableDays availableTimeSlots')
      : [];

    // Open requests in the same district or city. Somebody reading a centre's
    // page is usually either looking for blood or offering it, and this is
    // the half of the answer the centre's own shelf does not give.
    //
    // Matched in JS rather than with a regex in the query: a town is typed by
    // hand on the request form, so "surat" and "Surat " both have to match,
    // and a case-insensitive regex per area is both slower and the kind of
    // thing that behaves differently on every driver. The candidate set is
    // bounded first, so this never walks the whole collection.
    const area = [hospital.district, hospital.city]
      .filter(Boolean)
      .map((a) => String(a).trim().toLowerCase());

    let nearby = [];
    if (area.length) {
      const open = await DonationRequest.find({ status: 'pending' })
        .select('bloodGroupNeeded unitsNeeded location hospital urgency createdAt')
        .sort({ createdAt: -1 })
        .limit(400);
      nearby = open
        .filter((r) => area.includes(String(r.location || '').trim().toLowerCase()))
        .slice(0, 6);
    }

    res.json({ hospital, doctors, nearbyRequests: nearby });
  } catch (error) {
    // A malformed id is a 404 from the reader's point of view, not a crash.
    if (error.name === 'CastError') return res.status(404).json({ message: 'Centre not found' });
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

module.exports = { getHospitals, getHospital, addHospital, updateHospital, deleteHospital };
