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
      'name bloodGroup allergies emergencyContact heightCm weightKg medicalConditions medications'
    );
    if (!user) {
      return res.status(404).json({ message: 'No emergency record found for this QR code' });
    }

    // SCAN ALERT: record that this emergency page was just opened.
    // $slice: -20 keeps only the 20 most recent scans in the array.
    User.updateOne(
      { _id: user._id },
      { $push: { qrScans: { $each: [new Date()], $slice: -20 } } }
    ).catch(() => {}); // logging must never break the emergency page itself
    res.json({
      name: user.name,
      bloodGroup: user.bloodGroup,
      allergies: user.allergies,
      emergencyContact: user.emergencyContact,
      heightCm: user.heightCm,
      weightKg: user.weightKg,
      medicalConditions: user.medicalConditions,
      medications: user.medications,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getEmergencyInfo };
