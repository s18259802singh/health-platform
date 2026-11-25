// Handles: viewing and editing the logged-in user's own profile.
// req.user.id comes from the JWT middleware (auth.js) - so a user can only edit THEIR OWN data.

const QRCode = require('qrcode');
const User = require('../models/User');
const { rules, check, fail } = require('../utils/validate');
const clientUrl = require('../config/clientUrl');

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // SELF-HEALING QR: users created by the seed script (or older accounts)
    // have no QR yet - generate it on first profile visit and save it.
    if (!user.qrCodePath) {
      const emergencyUrl = `${clientUrl()}/emergency/${user._id}`;
      const qr = await QRCode.toDataURL(emergencyUrl);
      // Write just this field rather than saving the whole document back.
      // The record in hand was fetched without its password, and putting a
      // partial document through a full save is how fields get lost.
      await User.updateOne({ _id: user._id }, { $set: { qrCodePath: qr } });
      user.qrCodePath = qr;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, bloodGroup, allergies, emergencyContactName, emergencyContactNumber, isDonor, location } = req.body;

    // Same rules as registration, applied only to the fields being changed -
    // a profile save sends what the form holds, not the whole record.
    const schema = {
      name: rules.name,
      phone: rules.phone,
      bloodGroup: rules.bloodGroup,
      location: rules.optional(rules.place),
      allergies: rules.optional(rules.text({ label: 'Allergies', max: 200 })),
      emergencyContactName: rules.name,
      emergencyContactNumber: rules.phone,
    };
    const present = Object.fromEntries(
      Object.entries(schema).filter(([k]) => req.body[k] !== undefined && req.body[k] !== ''));
    const problems = check(req.body, present);
    if (Object.keys(problems).length) return fail(res, problems);

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = String(name).trim();
    if (phone) user.phone = String(phone).trim();
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (allergies !== undefined) user.allergies = allergies;
    if (location !== undefined) user.location = location;
    if (isDonor !== undefined) user.isDonor = isDonor;
    if (emergencyContactName) user.emergencyContact.name = emergencyContactName;
    if (emergencyContactNumber) user.emergencyContact.number = emergencyContactNumber;

    const updatedUser = await user.save();
    const { password, ...safeUser } = updatedUser.toObject();
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getProfile, updateProfile };
