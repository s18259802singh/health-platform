// ============================================================================
// ADMIN CRUD for the four modules added alongside the redesign:
// camps, donor stories, the guide library, and donation records.
// Mounted behind protect + adminOnly in routes/adminRoutes.js.
// ============================================================================

const Camp = require('../models/Camp');
const Story = require('../models/Story');
const Guide = require('../models/Guide');
const Donation = require('../models/Donation');
const User = require('../models/User');
const SupportMessage = require('../models/SupportMessage');

// ---------------------------------------------------------------- CAMPS ---

const listCamps = async (req, res) => {
  try {
    const { status = '', search = '' } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { organiser: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }
    res.json(await Camp.find(filter).sort({ date: -1 }));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createCamp = async (req, res) => {
  try {
    res.status(201).json(await Camp.create(req.body));
  } catch (error) {
    res.status(400).json({ message: 'Could not save camp', error: error.message });
  }
};

const updateCamp = async (req, res) => {
  try {
    // registrations are managed by members, never overwritten by a form post
    const { registrations, ...safe } = req.body;
    const camp = await Camp.findByIdAndUpdate(req.params.id, safe, { new: true, runValidators: true });
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    res.json(camp);
  } catch (error) {
    res.status(400).json({ message: 'Could not update camp', error: error.message });
  }
};

const deleteCamp = async (req, res) => {
  try {
    const camp = await Camp.findByIdAndDelete(req.params.id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    res.json({ message: 'Camp deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Full registration list, including phone numbers, for the organiser.
const getCampRegistrations = async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.id).select('title date venue city slots registrations');
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    res.json(camp);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// -------------------------------------------------------------- STORIES ---

const listStories = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { headline: { $regex: search, $options: 'i' } }] }
      : {};
    res.json(await Story.find(filter).sort({ featured: -1, createdAt: -1 }));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createStory = async (req, res) => {
  try {
    res.status(201).json(await Story.create(req.body));
  } catch (error) {
    res.status(400).json({ message: 'Could not save story', error: error.message });
  }
};

const updateStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json(story);
  } catch (error) {
    res.status(400).json({ message: 'Could not update story', error: error.message });
  }
};

const deleteStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json({ message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --------------------------------------------------------------- GUIDES ---

const listGuides = async (req, res) => {
  try {
    const { category = '' } = req.query;
    const filter = category ? { category } : {};
    res.json(await Guide.find(filter).sort({ category: 1, order: 1 }));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createGuide = async (req, res) => {
  try {
    res.status(201).json(await Guide.create(req.body));
  } catch (error) {
    res.status(400).json({ message: 'Could not save guide', error: error.message });
  }
};

const updateGuide = async (req, res) => {
  try {
    const guide = await Guide.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!guide) return res.status(404).json({ message: 'Guide not found' });
    res.json(guide);
  } catch (error) {
    res.status(400).json({ message: 'Could not update guide', error: error.message });
  }
};

const deleteGuide = async (req, res) => {
  try {
    const guide = await Guide.findByIdAndDelete(req.params.id);
    if (!guide) return res.status(404).json({ message: 'Guide not found' });
    res.json({ message: 'Guide deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ------------------------------------------------------------ DONATIONS ---

const listDonations = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const donations = await Donation.find()
      .populate('userId', 'name email bloodGroup location')
      .populate('hospitalId', 'name')
      .populate('campId', 'title')
      .sort({ donatedAt: -1 })
      .limit(300);

    const q = search.trim().toLowerCase();
    res.json(q
      ? donations.filter((d) => (d.userId?.name || '').toLowerCase().includes(q))
      : donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Recording a donation is what puts a member on the leaderboard and issues
// their certificate, so it is deliberately an administrator action.
const createDonation = async (req, res) => {
  try {
    const { userId, donatedAt, units, locationName, hospitalId, campId, notes } = req.body;
    if (!userId || !donatedAt) {
      return res.status(400).json({ message: 'userId and donatedAt are required' });
    }

    const member = await User.findById(userId).select('bloodGroup');
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const donation = await Donation.create({
      userId,
      donatedAt,
      bloodGroup: req.body.bloodGroup || member.bloodGroup,
      units: units || 1,
      hospitalId: hospitalId || undefined,
      campId: campId || undefined,
      locationName: locationName || '',
      notes: notes || '',
    });

    res.status(201).json(await donation.populate('userId', 'name email bloodGroup'));
  } catch (error) {
    res.status(400).json({ message: 'Could not record donation', error: error.message });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    res.json({ message: 'Donation record removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  listCamps, createCamp, updateCamp, deleteCamp, getCampRegistrations,
  listStories, createStory, updateStory, deleteStory,
  listGuides, createGuide, updateGuide, deleteGuide,
  listDonations, createDonation, deleteDonation,
};

// ---------------------------------------------------------------------------
// CERTIFICATES
// Issuing is a separate, deliberate act from recording a donation. A record
// says "this happened"; a certificate says "and we will put our name to it".
// ---------------------------------------------------------------------------

const issueCertificate = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (donation.certificateIssued) {
      return res.status(409).json({ message: 'That certificate has already been issued' });
    }

    donation.certificateIssued = true;
    donation.certificateIssuedAt = new Date();
    donation.certificateIssuedBy = req.user.id;
    await donation.save();

    const populated = await Donation.findById(donation._id).populate('userId', 'name bloodGroup location');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const revokeCertificate = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    donation.certificateIssued = false;
    donation.certificateIssuedAt = undefined;
    donation.certificateIssuedBy = undefined;
    await donation.save();
    res.json({ message: 'Certificate withdrawn', _id: donation._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Clearing a backlog one row at a time is how a queue stops being used.
const issueAllPending = async (req, res) => {
  try {
    const result = await Donation.updateMany(
      { certificateIssued: { $ne: true } },
      { $set: { certificateIssued: true, certificateIssuedAt: new Date(), certificateIssuedBy: req.user.id } }
    );
    res.json({ issued: result.modifiedCount ?? result.nModified ?? 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// SUPPORT INBOX
// ---------------------------------------------------------------------------

const listSupport = async (req, res) => {
  try {
    const { status = '', search = '' } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { message: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
      ];
    }
    const [rows, open] = await Promise.all([
      SupportMessage.find(filter).sort({ status: 1, createdAt: -1 }).limit(300)
        .populate('userId', 'name email phone')
        .populate('repliedBy', 'name'),
      SupportMessage.countDocuments({ status: 'open' }),
    ]);
    res.json({ rows, openCount: open });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const replySupport = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply || !String(reply).trim()) {
      return res.status(400).json({ message: 'A reply is required' });
    }
    const doc = await SupportMessage.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Message not found' });

    doc.reply = String(reply).trim().slice(0, 4000);
    doc.status = 'answered';
    doc.repliedAt = new Date();
    doc.repliedBy = req.user.id;
    await doc.save();

    const populated = await SupportMessage.findById(doc._id)
      .populate('userId', 'name email phone').populate('repliedBy', 'name');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const closeSupport = async (req, res) => {
  try {
    const doc = await SupportMessage.findByIdAndUpdate(
      req.params.id, { status: 'closed' }, { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Message not found' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports.issueCertificate = issueCertificate;
module.exports.revokeCertificate = revokeCertificate;
module.exports.issueAllPending = issueAllPending;
module.exports.listSupport = listSupport;
module.exports.replySupport = replySupport;
module.exports.closeSupport = closeSupport;
