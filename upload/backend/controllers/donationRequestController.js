// Handles: blood donation requests.
// Any logged-in user can post "I need B+ blood in Surat", everyone logged in
// can see the open requests (with the requester's contact number so donors
// can call), and the person who posted a request can mark it fulfilled.

const DonationRequest = require('../models/DonationRequest');
const User = require('../models/User');

// POST /api/donation-requests
const createRequest = async (req, res) => {
  try {
    const { bloodGroupNeeded, location } = req.body;
    if (!bloodGroupNeeded || !location) {
      return res.status(400).json({ message: 'bloodGroupNeeded and location are required' });
    }
    const request = await DonationRequest.create({
      requesterId: req.user.id,
      bloodGroupNeeded,
      location,
      status: 'pending',
    });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/donation-requests?bloodGroup=&status=
// populate() swaps the requesterId for the actual user's name and phone,
// so donors on the frontend know who to contact.
const getRequests = async (req, res) => {
  try {
    const { bloodGroup, status } = req.query;
    const filter = {};
    if (bloodGroup) filter.bloodGroupNeeded = bloodGroup;
    if (status) filter.status = status;

    const requests = await DonationRequest.find(filter)
      .populate('requesterId', 'name phone location')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/donation-requests/:id/fulfil
// Only the person who created the request can close it.
const fulfilRequest = async (req, res) => {
  try {
    const request = await DonationRequest.findOne({ _id: req.params.id, requesterId: req.user.id });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = 'fulfilled';
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/donation-requests/:id/respond
// A donor raises their hand: "I can donate". Stored once per donor.
const respondToRequest = async (req, res) => {
  try {
    const request = await DonationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'This request is already fulfilled' });
    if (String(request.requesterId) === req.user.id) {
      return res.status(400).json({ message: 'You cannot respond to your own request' });
    }
    if (request.responders.some((r) => String(r.userId) === req.user.id)) {
      return res.status(400).json({ message: 'You have already responded to this request' });
    }
    const me = await User.findById(req.user.id).select('name phone bloodGroup');
    request.responders.push({ userId: me._id, name: me.name, phone: me.phone, bloodGroup: me.bloodGroup });
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createRequest, getRequests, fulfilRequest, respondToRequest };
