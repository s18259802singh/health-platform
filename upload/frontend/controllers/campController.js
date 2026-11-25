// PUBLIC + MEMBER camp endpoints. Administrators manage camps from the console.

const Camp = require('../models/Camp');
const User = require('../models/User');
const { rules, check, fail } = require('../utils/validate');

// GET /api/camps?city=&state=&status=&upcoming=true   (PUBLIC)
const getCamps = async (req, res) => {
  try {
    const { city = '', state = '', status = '', upcoming = '' } = req.query;
    const filter = {};
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (state) filter.state = { $regex: state, $options: 'i' };
    if (upcoming === 'true') {
      filter.date = { $gte: new Date().toISOString().slice(0, 10) };
      filter.status = 'upcoming';
    } else if (status && status !== 'pending' && status !== 'rejected') {
      filter.status = status;
    } else {
      // A camp somebody has only APPLIED to run is not a camp yet. Without
      // this, every application would appear on the public page the moment
      // it was submitted - including its organiser's phone number.
      filter.status = { $in: ['upcoming', 'completed', 'cancelled'] };
    }

    const camps = await Camp.find(filter)
      .select('-registrations.userId')   // never leak member ids publicly
      .sort({ date: 1 })
      .limit(100);

    res.json(camps);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/camps/:id   (PUBLIC)
const getCampById = async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.id)
      .select('-registrations.userId -registrations.phone -applicant.email -applicant.phone -applicant.userId');
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    // Same reasoning as the listing: an application is not a public camp.
    if (camp.status === 'pending' || camp.status === 'rejected') {
      return res.status(404).json({ message: 'Camp not found' });
    }
    res.json(camp);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/camps/:id/register   (member)
const registerForCamp = async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    if (camp.status !== 'upcoming') {
      return res.status(400).json({ message: 'This camp is no longer taking registrations' });
    }

    const already = camp.registrations.some((r) => String(r.userId) === String(req.user.id));
    if (already) return res.status(409).json({ message: 'You are already registered for this camp' });

    if (camp.registrations.length >= camp.slots) {
      return res.status(409).json({ message: 'This camp is fully booked' });
    }

    const user = await User.findById(req.user.id).select('name phone bloodGroup');
    camp.registrations.push({
      userId: user._id, name: user.name, phone: user.phone, bloodGroup: user.bloodGroup,
    });
    await camp.save();

    res.status(201).json({ message: 'You are registered', slotsLeft: camp.slots - camp.registrations.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/camps/:id/register   (member cancels)
const cancelRegistration = async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });

    const before = camp.registrations.length;
    camp.registrations = camp.registrations.filter((r) => String(r.userId) !== String(req.user.id));
    if (camp.registrations.length === before) {
      return res.status(404).json({ message: 'You were not registered for this camp' });
    }
    await camp.save();
    res.json({ message: 'Registration cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/camps/mine/list   (member's own camps)
const getMyCamps = async (req, res) => {
  try {
    const camps = await Camp.find({ 'registrations.userId': req.user.id })
      .select('title venue city date startTime endTime status organiser')
      .sort({ date: 1 });
    res.json(camps);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/camps/apply   (PUBLIC, member optional)
//
// Anyone running a workplace, campus or society drive can apply to have it
// listed. It is created as a 'pending' camp, which is invisible everywhere
// until an administrator approves it in the console - so this cannot be used
// to publish anything.
//
// Deliberately open to signed-out visitors: the people who organise these are
// usually an HR officer or a student secretary acting once, and making them
// register an account first is how an application form stops being used.
const applyForCamp = async (req, res) => {
  try {
    const problems = check(req.body, {
      title: rules.text({ label: 'Camp name', min: 4, max: 140 }),
      organiser: rules.text({ label: 'Organisation', min: 2, max: 120 }),
      venue: rules.text({ label: 'Venue', min: 4, max: 240 }),
      city: rules.place,
      // isoDate checks the shape; a camp in the past is the mistake this
      // form actually invites, because a date picker opens wherever it was
      // left.
      date: rules.all(
        rules.isoDate({ label: 'Camp date' }),
        (v) => (String(v) <= new Date().toISOString().slice(0, 10)
          ? 'Pick a date at least a day from now'
          : ''),
      ),
      contactName: rules.name,
      contactNumber: rules.phone,
      contactEmail: rules.email,
    });

    const expected = Number(req.body.expectedDonors);
    if (req.body.expectedDonors !== undefined && req.body.expectedDonors !== '') {
      if (!Number.isFinite(expected) || expected < 10 || expected > 2000) {
        problems.expectedDonors = 'Enter an expected turnout between 10 and 2000';
      }
    }
    if (Object.keys(problems).length) return fail(res, problems);

    const camp = await Camp.create({
      title: String(req.body.title).trim(),
      organiser: String(req.body.organiser).trim(),
      venue: String(req.body.venue).trim(),
      city: String(req.body.city).trim(),
      state: String(req.body.state || '').trim(),
      date: req.body.date,
      startTime: req.body.startTime || '09:00 AM',
      endTime: req.body.endTime || '04:00 PM',
      slots: Number.isFinite(expected) && expected > 0 ? Math.round(expected) : 100,
      contactNumber: String(req.body.contactNumber).trim(),
      description: String(req.body.description || '').trim(),
      status: 'pending',
      applicant: {
        name: String(req.body.contactName).trim(),
        organisation: String(req.body.organiser).trim(),
        email: String(req.body.contactEmail).trim().toLowerCase(),
        phone: String(req.body.contactNumber).trim(),
        expectedDonors: Number.isFinite(expected) ? Math.round(expected) : 0,
        note: String(req.body.description || '').trim(),
        userId: req.user?.id || undefined,
        appliedAt: new Date(),
      },
    });

    // The reply carries no ids or contact details - it is a receipt, and the
    // form is open to anyone.
    res.status(201).json({
      message: 'Application received',
      reference: String(camp._id).slice(-6).toUpperCase(),
      title: camp.title,
      date: camp.date,
      city: camp.city,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getCamps, getCampById, registerForCamp, cancelRegistration, getMyCamps, applyForCamp,
};
