// Handles: blood donation requests.
// Any logged-in user can post "I need B+ blood in Surat", everyone logged in
// can see the open requests (with the requester's contact number so donors
// can call), and the person who posted a request can mark it fulfilled.

const DonationRequest = require('../models/DonationRequest');

// POST /api/donation-requests
const createRequest = async (req, res) => {
  try {
    const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const { bloodGroupNeeded, location, unitsNeeded, hospital, note, urgency } = req.body;

    // Validate here as well as in the browser: the form is not the only way
    // into this endpoint, and a bad record is far more expensive to find
    // later than to refuse now.
    const problems = {};
    if (!bloodGroupNeeded) problems.bloodGroupNeeded = 'Choose the blood group needed';
    else if (!GROUPS.includes(bloodGroupNeeded)) problems.bloodGroupNeeded = 'That is not a blood group';

    const place = String(location || '').trim();
    if (!place) problems.location = 'Say where the blood is needed';
    else if (place.length < 2) problems.location = 'Give the town or city';
    else if (place.length > 80) problems.location = 'Keep the place under 80 characters';

    const units = unitsNeeded === undefined || unitsNeeded === '' ? 1 : Number(unitsNeeded);
    if (!Number.isFinite(units) || units < 1 || units > 20 || units % 1 !== 0) {
      problems.unitsNeeded = 'Units must be a whole number between 1 and 20';
    }
    if (note && String(note).length > 300) problems.note = 'Keep the note under 300 characters';
    if (urgency && !['routine', 'urgent', 'critical'].includes(urgency)) {
      problems.urgency = 'Choose how urgent this is';
    }

    if (Object.keys(problems).length) {
      return res.status(400).json({ message: 'Please correct the highlighted fields', errors: problems });
    }

    const request = await DonationRequest.create({
      requesterId: req.user.id,
      bloodGroupNeeded,
      location: place,
      unitsNeeded: units,
      hospital: String(hospital || '').trim().slice(0, 120),
      note: String(note || '').trim().slice(0, 300),
      urgency: urgency || 'urgent',
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
    if (request.status !== 'pending') {
      return res.status(409).json({ message: `This request is already ${request.status}` });
    }
    request.status = 'fulfilled';
    request.fulfilledAt = new Date();
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/donation-requests/:id/cancel
// Withdrawing a request is not the same as it being answered, and the board
// should not imply somebody donated when nobody did.
const cancelRequest = async (req, res) => {
  try {
    const request = await DonationRequest.findOne({ _id: req.params.id, requesterId: req.user.id });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(409).json({ message: `This request is already ${request.status}` });
    }
    request.status = 'cancelled';
    request.cancelledAt = new Date();
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createRequest, getRequests, fulfilRequest, cancelRequest };
