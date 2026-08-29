// Handles: searching for blood donors by blood group and/or location.
// This is the "AJAX search" feature, done the React way - the frontend calls this
// API through Axios every time the search box changes, and the list updates
// without a page reload.

const User = require('../models/User');

// GET /api/donors?bloodGroup=B+&location=Surat
const searchDonors = async (req, res) => {
  try {
    const { bloodGroup, location } = req.query;

    const filter = { isDonor: true };
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (location) filter.location = { $regex: location, $options: 'i' }; // case-insensitive partial match

    const donors = await User.find(filter).select('name bloodGroup phone location');
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { searchDonors };
