// FIND CARE NEAR ME
// One question — "I am here, and this is what is wrong" — answered with the
// centres closest to them, what each one has in stock, and which doctors
// there treat it, in a shape the booking form can use directly.

const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const { CONDITIONS, distanceKm, resolvePlace, titleCase, norm } = require('../config/places');

// GET /api/care/options — everything the form needs to render itself.
const getOptions = async (req, res) => {
  try {
    const cities = await Hospital.distinct('city');
    res.json({
      cities: cities.filter(Boolean).sort(),
      conditions: CONDITIONS.map(({ id, label }) => ({ id, label })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/care/near?place=&condition=&type=&bloodGroup=&limit=
// Public on purpose: somebody looking for the nearest blood bank should not
// meet a login wall first.
const findNear = async (req, res) => {
  try {
    const { place = '', condition = '', type = '', bloodGroup = '', limit = 12 } = req.query;

    const origin = resolvePlace(place);
    if (!origin) {
      return res.status(400).json({
        message: place
          ? `We do not have a centre list for “${place}”. Try the nearest town.`
          : 'Tell us roughly where you are.',
        unresolved: true,
      });
    }

    const filter = {};
    if (type) filter.type = type;
    const centres = await Hospital.find(filter).limit(400).lean();

    const wanted = CONDITIONS.find((c) => c.id === condition);

    // Doctors are fetched once for the shortlist rather than per centre.
    const ranked = centres
      .map((h) => {
        const coords = resolvePlace(h.city) || resolvePlace(h.address);
        const stock = h.availableBloodUnits || [];
        const forGroup = bloodGroup ? stock.find((u) => u.bloodGroup === bloodGroup) : null;
        return {
          ...h,
          _coords: coords?.coords || null,
          distanceKm: coords ? Math.round(distanceKm(origin.coords, coords.coords)) : null,
          units: bloodGroup ? (forGroup?.units || 0) : stock.reduce((a, u) => a + (u.units || 0), 0),
        };
      })
      // A centre we cannot place is not "very far away", it is unknown — and
      // guessing would put it at the top of the list.
      .filter((h) => h.distanceKm !== null)
      .filter((h) => (bloodGroup ? h.units > 0 : true))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, Math.min(40, Number(limit) || 12));

    const doctors = await Doctor.find({ hospitalId: { $in: ranked.map((h) => h._id) } })
      .select('name specialization hospitalId availableDays availableTimeSlots')
      .lean();

    const byHospital = {};
    doctors.forEach((d) => {
      const key = String(d.hospitalId);
      (byHospital[key] = byHospital[key] || []).push(d);
    });

    const results = ranked.map((h) => {
      const all = byHospital[String(h._id)] || [];
      const matching = wanted
        ? all.filter((d) => wanted.specialisms.includes(d.specialization))
        : all;
      return {
        _id: h._id,
        name: h.name,
        address: h.address,
        city: h.city,
        district: h.district,
        type: h.type,
        contactNumber: h.contactNumber,
        distanceKm: h.distanceKm,
        units: h.units,
        breakdown: h.availableBloodUnits || [],
        doctors: matching.map((d) => ({
          _id: d._id,
          name: d.name,
          specialization: d.specialization,
          availableDays: d.availableDays,
          availableTimeSlots: d.availableTimeSlots,
        })),
        doctorCount: all.length,
      };
    });

    res.json({
      origin: { place: titleCase(origin.place), query: place },
      condition: wanted ? { id: wanted.id, label: wanted.label, specialisms: wanted.specialisms } : null,
      bloodGroup,
      count: results.length,
      // When a condition is chosen, a centre with nobody who treats it is
      // still worth showing for its stock - but it should not be first.
      results: wanted
        ? [...results].sort((a, b) => (b.doctors.length > 0) - (a.doctors.length > 0) || a.distanceKm - b.distanceKm)
        : results,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getOptions, findNear };
