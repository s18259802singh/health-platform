// This is the ONE deliberately PUBLIC controller in the whole app.
// No JWT check happens here - anyone who scans the QR code can see this page,
// even a stranger with no account. That is the whole point of an emergency QR.
// It only ever returns life-saving info: blood group, allergies, emergency contact.
// It NEVER returns email, password, or anything else from the user document.

const User = require('../models/User');

// GET /api/emergency/:userId  (PUBLIC - no auth middleware attached to this route)
const getEmergencyInfo = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      'name bloodGroup allergies emergencyContact'
    );
    if (!user) {
      return res.status(404).json({ message: 'No emergency record found for this QR code' });
    }
    res.json({
      name: user.name,
      bloodGroup: user.bloodGroup,
      allergies: user.allergies,
      emergencyContact: user.emergencyContact,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getEmergencyInfo };
