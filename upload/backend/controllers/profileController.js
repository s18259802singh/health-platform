// Handles: viewing and editing the logged-in user's own profile.
// req.user.id comes from the JWT middleware (auth.js) - so a user can only edit THEIR OWN data.

const QRCode = require('qrcode');
const User = require('../models/User');

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // SELF-HEALING QR: users created by the seed script (or older accounts)
    // have no QR yet - generate it on first profile visit and save it.
    if (!user.qrCodePath) {
      const emergencyUrl = `${process.env.CLIENT_URL}/emergency/${user._id}`;
      user.qrCodePath = await QRCode.toDataURL(emergencyUrl);
      await user.save();
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, bloodGroup, allergies, emergencyContactName, emergencyContactNumber, isDonor, location,
            heightCm, weightKg, medicalConditions, medications } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (allergies !== undefined) user.allergies = allergies;
    if (location !== undefined) user.location = location;
    if (isDonor !== undefined) user.isDonor = isDonor;
    if (heightCm !== undefined) user.heightCm = heightCm === '' ? null : Number(heightCm);
    if (weightKg !== undefined) user.weightKg = weightKg === '' ? null : Number(weightKg);
    if (medicalConditions !== undefined) user.medicalConditions = medicalConditions;
    if (medications !== undefined) user.medications = medications;
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
