// Handles: live platform statistics.
// Powers the "Blood Supply Monitor" on the dashboard - real counts from the
// database, not decorative numbers.

const User = require('../models/User');
const DonationRequest = require('../models/DonationRequest');

// GET /api/stats/blood-supply
// Returns, for each blood group: how many willing donors exist and how many
// donation requests are still pending. requests > donors means a shortage.
const getBloodSupply = async (req, res) => {
  try {
    const donorCounts = await User.aggregate([
      { $match: { isDonor: true } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
    ]);
    const requestCounts = await DonationRequest.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: '$bloodGroupNeeded', count: { $sum: 1 } } },
    ]);

    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const supply = groups.map((g) => ({
      group: g,
      donors: donorCounts.find((d) => d._id === g)?.count || 0,
      pendingRequests: requestCounts.find((r) => r._id === g)?.count || 0,
    }));

    res.json(supply);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getBloodSupply };
