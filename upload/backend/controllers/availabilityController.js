// The eRaktKosh-style blood availability search.
// Deliberately PUBLIC: someone searching for blood in an emergency should not
// have to create an account first. It returns stock counts and contact
// numbers only - never any member's personal data.

const Hospital = require('../models/Hospital');

// Blood "components" map onto whole units in this dataset; the selector is
// kept because every real blood-bank portal has one and users expect it.
const COMPONENTS = ['Whole Blood', 'Packed Red Cells', 'Plasma', 'Platelets'];

// GET /api/availability/regions
// Powers the cascading state -> district selectors without a second round trip.
const getRegions = async (req, res) => {
  try {
    const rows = await Hospital.aggregate([
      { $group: { _id: { state: '$state', district: '$district' }, count: { $sum: 1 } } },
      { $sort: { '_id.state': 1, '_id.district': 1 } },
    ]);

    const map = new Map();
    rows.forEach((r) => {
      const state = (r._id.state || '').trim();
      const district = (r._id.district || '').trim();
      if (!state) return;
      if (!map.has(state)) map.set(state, new Set());
      if (district) map.get(state).add(district);
    });

    const states = [...map.entries()]
      .map(([state, districts]) => ({ state, districts: [...districts].sort() }))
      .sort((a, b) => a.state.localeCompare(b.state));

    res.json({ states, components: COMPONENTS });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/availability?state=&district=&bloodGroup=&type=&search=
// Returns one row per blood bank: its stock for the requested group (or the
// full breakdown when no group is given), plus a simple availability label.
const searchAvailability = async (req, res) => {
  try {
    const { state = '', district = '', bloodGroup = '', type = '', search = '' } = req.query;

    const filter = {};
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const hospitals = await Hospital.find(filter).sort({ name: 1 }).limit(300);

    const results = hospitals.map((h) => {
      const stock = h.availableBloodUnits || [];
      const match = bloodGroup ? stock.find((u) => u.bloodGroup === bloodGroup) : null;
      const units = bloodGroup ? (match?.units || 0) : stock.reduce((a, u) => a + (u.units || 0), 0);

      let availability = 'none';
      if (units > 10) availability = 'good';
      else if (units > 3) availability = 'limited';
      else if (units > 0) availability = 'critical';

      return {
        _id: h._id,
        name: h.name,
        address: h.address,
        city: h.city,
        district: h.district,
        state: h.state,
        contactNumber: h.contactNumber,
        type: h.type,
        units,
        availability,
        breakdown: stock,
      };
    });

    // When a group was asked for, put the banks that actually have it first.
    if (bloodGroup) results.sort((a, b) => b.units - a.units);

    res.json({
      query: { state, district, bloodGroup, type, search },
      count: results.length,
      withStock: results.filter((r) => r.units > 0).length,
      totalUnits: results.reduce((a, r) => a + r.units, 0),
      results,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getRegions, searchAvailability };
