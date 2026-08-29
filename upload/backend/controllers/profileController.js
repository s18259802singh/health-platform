// Handles: viewing and editing the logged-in user's own profile.
// req.user.id comes from the JWT middleware (auth.js) - so a user can only edit THEIR OWN data.

const User = require('../models/User');

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, bloodGroup, allergies, emergencyContactName, emergencyContactNumber, isDonor, location } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
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
