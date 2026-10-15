// PUBLIC + MEMBER camp endpoints. Administrators manage camps from the console.

const Camp = require('../models/Camp');
const User = require('../models/User');

// GET /api/camps?city=&state=&status=&upcoming=true   (PUBLIC)
const getCamps = async (req, res) => {
  try {
    const { city = '', state = '', status = '', upcoming = '' } = req.query;
    const filter = {};
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (state) filter.state = { $regex: state, $options: 'i' };
    if (status) filter.status = status;
    if (upcoming === 'true') {
      filter.date = { $gte: new Date().toISOString().slice(0, 10) };
      filter.status = 'upcoming';
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
    const camp = await Camp.findById(req.params.id).select('-registrations.userId -registrations.phone');
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
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

module.exports = { getCamps, getCampById, registerForCamp, cancelRegistration, getMyCamps };
