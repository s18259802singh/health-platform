// Donations drive two things the reference platforms do not have:
// a donor leaderboard, and a downloadable donation certificate.
// Records are created by an administrator only, so the board is trustworthy.

const Donation = require('../models/Donation');
const User = require('../models/User');

// Recognition tiers. Kept here so the API and the UI can never disagree.
const TIERS = [
  { min: 25, label: 'Platinum', note: '25+ donations' },
  { min: 15, label: 'Gold', note: '15+ donations' },
  { min: 8, label: 'Silver', note: '8+ donations' },
  { min: 3, label: 'Bronze', note: '3+ donations' },
  { min: 1, label: 'Donor', note: 'First donation made' },
];

const tierFor = (count) => TIERS.find((t) => count >= t.min) || { label: 'Registered', note: 'No donations yet' };

// GET /api/donations/leaderboard?limit=&city=&bloodGroup=   (PUBLIC)
// Shows first name + last initial and city only - never phone or email.
const getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const { city = '', bloodGroup = '' } = req.query;

    const rows = await Donation.aggregate([
      { $group: { _id: '$userId', donations: { $sum: 1 }, units: { $sum: '$units' }, last: { $max: '$donatedAt' } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $sort: { donations: -1, units: -1, last: -1 } },
      { $limit: 300 },
    ]);

    let entries = rows.map((r, i) => {
      const parts = (r.user.name || '').trim().split(/\s+/);
      const display = parts.length > 1
        ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
        : parts[0] || 'Donor';
      return {
        rank: i + 1,
        name: display,
        city: r.user.location || '',
        bloodGroup: r.user.bloodGroup,
        donations: r.donations,
        units: r.units,
        lastDonation: r.last,
        tier: tierFor(r.donations).label,
      };
    });

    if (city) entries = entries.filter((e) => e.city.toLowerCase().includes(city.toLowerCase()));
    if (bloodGroup) entries = entries.filter((e) => e.bloodGroup === bloodGroup);

    // Re-rank after filtering so positions stay 1..n
    entries = entries.slice(0, limit).map((e, i) => ({ ...e, rank: i + 1 }));

    const totals = await Donation.aggregate([
      { $group: { _id: null, donations: { $sum: 1 }, units: { $sum: '$units' }, donors: { $addToSet: '$userId' } } },
    ]);

    res.json({
      entries,
      tiers: TIERS,
      totals: {
        donations: totals[0]?.donations || 0,
        units: totals[0]?.units || 0,
        donors: totals[0]?.donors?.length || 0,
        livesTouched: (totals[0]?.units || 0) * 3, // one unit can help up to three people
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/donations/mine   (member's own record + certificate data)
const getMyDonations = async (req, res) => {
  try {
    const [donations, user] = await Promise.all([
      Donation.find({ userId: req.user.id })
        .populate('hospitalId', 'name city')
        .populate('campId', 'title city')
        .sort({ donatedAt: -1 }),
      User.findById(req.user.id).select('name bloodGroup location'),
    ]);

    const count = donations.length;
    const units = donations.reduce((a, d) => a + (d.units || 0), 0);
    const tier = tierFor(count);

    // How far to the next tier up - gives the UI something to show as progress.
    const higher = [...TIERS].reverse().find((t) => t.min > count);

    res.json({
      member: { name: user?.name, bloodGroup: user?.bloodGroup, city: user?.location },
      donations,
      summary: {
        count,
        units,
        livesTouched: units * 3,
        tier: tier.label,
        tierNote: tier.note,
        nextTier: higher ? { label: higher.label, needed: higher.min - count } : null,
        firstDonation: donations.length ? donations[donations.length - 1].donatedAt : null,
        lastDonation: donations.length ? donations[0].donatedAt : null,
        // So the member's page can say "2 certificates waiting to be issued"
        // instead of silently showing some rows without a download link.
        certificatesIssued: donations.filter((d) => d.certificateIssued).length,
        certificatesPending: donations.filter((d) => !d.certificateIssued).length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/donations/:id/certificate   (member's own certificate only)
const getCertificate = async (req, res) => {
  try {
    const donation = await Donation.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('hospitalId', 'name city state')
      .populate('campId', 'title city state');
    if (!donation) return res.status(404).json({ message: 'Certificate not found' });

    // A certificate is a document the network stands behind, so it is issued
    // by an administrator rather than minted the moment a row is created.
    // Until then the member can see that the donation is on their record -
    // they just cannot download a certificate for it yet.
    if (!donation.certificateIssued) {
      return res.status(409).json({
        message: 'This certificate has not been issued yet',
        status: 'pending',
        donatedAt: donation.donatedAt,
      });
    }

    const user = await User.findById(req.user.id).select('name bloodGroup location');
    const index = await Donation.countDocuments({ userId: req.user.id, donatedAt: { $lte: donation.donatedAt } });

    res.json({
      certificateNo: donation.certificateNo,
      name: user.name,
      bloodGroup: donation.bloodGroup,
      units: donation.units,
      donatedAt: donation.donatedAt,
      location: donation.locationName || donation.hospitalId?.name || donation.campId?.title || 'LifeLink partner centre',
      city: donation.hospitalId?.city || donation.campId?.city || user.location || '',
      donationNumber: index,
      livesTouched: (donation.units || 1) * 3,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getLeaderboard, getMyDonations, getCertificate, TIERS };
