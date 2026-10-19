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
const { rules, check, fail } = require('../utils/validate');

// The console's edit forms send the whole record, but a row action such as
// "feature this story" sends a single field. Checking only the keys that
// arrived lets both through without a partial update tripping over fields it
// never mentioned.
const onlyPresent = (body, schema) => Object.fromEntries(
  Object.entries(schema).filter(([field]) => body[field] !== undefined),
);

const trimmed = (v) => String(v == null ? '' : v).trim();

// An ObjectId, as the console's pickers always send. Spelled out rather than
// left to Mongoose, whose cast error reads as a server fault.
const isObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(String(v || ''));

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

// Camp times are stored as the free text the public pages render ("09:00 AM"),
// so they have to be parsed before they can be compared. Returns minutes
// since midnight, or null when the text is not a time. Mirrors the same
// helper in frontend/src/admin/pages/Camps.jsx.
const minutesOf = (v) => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/.exec(String(v || '').trim().toUpperCase());
  if (!m) return null;
  let hours = Number(m[1]);
  const mins = Number(m[2]);
  if (mins > 59) return null;
  if (m[3]) {
    if (hours < 1 || hours > 12) return null;
    hours = (hours % 12) + (m[3] === 'PM' ? 12 : 0);
  } else if (hours > 23) return null;
  return (hours * 60) + mins;
};

const timeRule = (label) => (v) => {
  if (!trimmed(v)) return `${label} is required`;
  return minutesOf(v) === null ? 'Use a time like 09:00 AM' : '';
};

// Same rules and same wording as frontend/src/admin/pages/Camps.jsx. The
// capacity floor depends on the camp being edited, so the schema is built per
// camp rather than declared once.
const campSchema = (taken) => ({
  title: rules.text({ label: 'Camp title', min: 3, max: 120 }),
  organiser: rules.text({ label: 'Organiser', min: 2, max: 120 }),
  venue: rules.text({ label: 'Venue', min: 3, max: 160 }),
  city: rules.place,
  state: rules.optional(rules.place),
  date: rules.isoDate({ label: 'Date' }),
  startTime: timeRule('Start time'),
  endTime: rules.all(timeRule('End time'), (v, all) => {
    const from = minutesOf(all.startTime);
    const to = minutesOf(v);
    return from !== null && to !== null && to <= from ? 'The end time must be after the start time' : '';
  }),
  slots: rules.all(
    rules.number({ label: 'Slots', min: 1, max: 2000 }),
    // Shrinking a camp below the people already on its list would silently
    // turn confirmed registrations into over-booking.
    (v) => (Number(v) < taken ? `Slots cannot be fewer than the ${taken} already registered` : ''),
  ),
  contactNumber: rules.optional(rules.anyPhone),
  description: rules.optional(rules.text({ label: 'Description', max: 2000 })),
  status: rules.optional(rules.oneOf(['upcoming', 'completed', 'cancelled'], 'Status')),
});

const CAMP_TEXT = ['title', 'organiser', 'venue', 'city', 'state', 'date',
  'startTime', 'endTime', 'contactNumber', 'description', 'status'];

const campFields = (body) => {
  const payload = {};
  CAMP_TEXT.forEach((key) => { if (body[key] !== undefined) payload[key] = trimmed(body[key]); });
  if (body.slots !== undefined) payload.slots = Number(body.slots);
  // Not trimmed: this is a base64 data URL or a remote link, not prose.
  if (body.imageUrl !== undefined) payload.imageUrl = String(body.imageUrl || '');
  return payload;
};

const createCamp = async (req, res) => {
  try {
    const problems = check(req.body, campSchema(0));
    if (Object.keys(problems).length) return fail(res, problems);

    res.status(201).json(await Camp.create(campFields(req.body)));
  } catch (error) {
    res.status(400).json({ message: 'Could not save camp', error: error.message });
  }
};

const updateCamp = async (req, res) => {
  try {
    const existing = await Camp.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Camp not found' });

    // registrations are managed by members, never overwritten by a form post
    const { registrations, ...safe } = req.body;

    // The cross-field rules need both times and the registration count, so
    // they run against the record as it would be rather than the patch alone.
    const taken = existing.registrations?.length || 0;
    const merged = { ...existing.toObject(), ...safe };
    const problems = check(merged, onlyPresent(safe, campSchema(taken)));
    if (Object.keys(problems).length) return fail(res, problems);

    const camp = await Camp.findByIdAndUpdate(req.params.id, campFields(safe), { new: true, runValidators: true });
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

// Same rules and same wording as frontend/src/admin/pages/Stories.jsx. Blood
// group and town stay optional: some people tell their story but would rather
// not be that findable.
const storySchema = {
  headline: rules.text({ label: 'Headline', min: 6, max: 120 }),
  name: rules.name,
  bloodGroup: rules.optional(rules.bloodGroup),
  city: rules.optional(rules.place),
  body: rules.text({ label: 'The story', min: 60, max: 4000 }),
  role: rules.optional(rules.oneOf(['donor', 'recipient', 'organiser'], 'Role')),
};

const storyFields = (body) => {
  const payload = {};
  ['name', 'headline', 'body', 'city', 'bloodGroup', 'role'].forEach((key) => {
    if (body[key] !== undefined) payload[key] = trimmed(body[key]);
  });
  if (body.featured !== undefined) payload.featured = !!body.featured;
  if (body.imageUrl !== undefined) payload.imageUrl = String(body.imageUrl || '');
  return payload;
};

const createStory = async (req, res) => {
  try {
    const problems = check(req.body, storySchema);
    if (Object.keys(problems).length) return fail(res, problems);

    res.status(201).json(await Story.create(storyFields(req.body)));
  } catch (error) {
    res.status(400).json({ message: 'Could not save story', error: error.message });
  }
};

const updateStory = async (req, res) => {
  try {
    const problems = check(req.body, onlyPresent(req.body, storySchema));
    if (Object.keys(problems).length) return fail(res, problems);

    const story = await Story.findByIdAndUpdate(req.params.id, storyFields(req.body), { new: true, runValidators: true });
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

// Same rules and same wording as frontend/src/admin/pages/Guides.jsx. Order
// positions a guide within its category, so zero and negatives would put it
// nowhere the public hub can show it.
const guideSchema = {
  category: rules.oneOf(['education', 'eligibility', 'preparation', 'recovery', 'regular'], 'Category'),
  title: rules.text({ label: 'Title', min: 4, max: 120 }),
  summary: rules.text({ label: 'Summary', min: 10, max: 200 }),
  body: rules.text({ label: 'Guide body', min: 60, max: 8000 }),
  readMinutes: rules.number({ label: 'Read time', min: 1, max: 60 }),
  order: rules.number({ label: 'Order', min: 1, max: 99 }),
};

const guideFields = (body) => {
  const payload = {};
  ['category', 'title', 'summary', 'body'].forEach((key) => {
    if (body[key] !== undefined) payload[key] = trimmed(body[key]);
  });
  if (body.readMinutes !== undefined) payload.readMinutes = Number(body.readMinutes);
  if (body.order !== undefined) payload.order = Number(body.order);
  return payload;
};

const createGuide = async (req, res) => {
  try {
    const problems = check(req.body, guideSchema);
    if (Object.keys(problems).length) return fail(res, problems);

    res.status(201).json(await Guide.create(guideFields(req.body)));
  } catch (error) {
    res.status(400).json({ message: 'Could not save guide', error: error.message });
  }
};

const updateGuide = async (req, res) => {
  try {
    const problems = check(req.body, onlyPresent(req.body, guideSchema));
    if (Object.keys(problems).length) return fail(res, problems);

    const guide = await Guide.findByIdAndUpdate(req.params.id, guideFields(req.body), { new: true, runValidators: true });
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
// Same rules and same wording as frontend/src/admin/pages/Donations.jsx.
// Four units is the most one sitting can produce, and a donation cannot have
// happened tomorrow - both mistakes reach the public leaderboard if they get
// through.
const donationSchema = {
  userId: rules.all(
    rules.required('Member'),
    (v) => (isObjectId(v) ? '' : 'Choose a member from the list'),
  ),
  donatedAt: rules.all(
    rules.isoDate({ label: 'Date of donation' }),
    (v) => (new Date(`${v}T00:00:00`) > new Date() ? 'Date of donation cannot be in the future' : ''),
  ),
  units: rules.number({ label: 'Units', min: 1, max: 4 }),
  locationName: rules.optional(rules.text({ label: 'Location', max: 120 })),
  notes: rules.optional(rules.text({ label: 'Notes', max: 300 })),
  bloodGroup: rules.optional(rules.bloodGroup),
  hospitalId: rules.optional((v) => (isObjectId(v) ? '' : 'Choose a centre from the list')),
  campId: rules.optional((v) => (isObjectId(v) ? '' : 'Choose a camp from the list')),
};

const createDonation = async (req, res) => {
  try {
    const { userId, donatedAt, units, locationName, hospitalId, campId, notes } = req.body;

    const problems = check(req.body, donationSchema);
    if (Object.keys(problems).length) return fail(res, problems);

    const member = await User.findById(userId).select('bloodGroup');
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const donation = await Donation.create({
      userId,
      donatedAt,
      bloodGroup: req.body.bloodGroup || member.bloodGroup,
      units: Number(units),
      hospitalId: hospitalId || undefined,
      campId: campId || undefined,
      locationName: trimmed(locationName),
      notes: trimmed(notes),
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
// SUPPORT INBOX — live chat, administrator side
// ---------------------------------------------------------------------------

const listSupport = async (req, res) => {
  try {
    const { status = '', search = '' } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { 'messages.body': { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
      ];
    }
    const [rows, open] = await Promise.all([
      SupportMessage.find(filter).sort({ status: 1, lastMessageAt: -1 }).limit(200)
        .populate('userId', 'name email phone'),
      SupportMessage.countDocuments({ status: 'open' }),
    ]);
    res.json({ rows, openCount: open });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /admin/support/:id/reply   { reply }
const replySupport = async (req, res) => {
  try {
    const body = String(req.body.reply || '').trim();
    if (!body) return res.status(400).json({ message: 'Type a reply first' });

    const thread = await SupportMessage.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Conversation not found' });

    thread.push({
      from: 'admin',
      body: body.slice(0, 4000),
      byId: req.user.id,
      byName: req.user.name || 'LifeLink team',
      at: new Date(),
    });
    await thread.save();

    const populated = await SupportMessage.findById(thread._id).populate('userId', 'name email phone');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const closeSupport = async (req, res) => {
  try {
    const thread = await SupportMessage.findByIdAndUpdate(
      req.params.id, { status: 'closed' }, { new: true }
    ).populate('userId', 'name email phone');
    if (!thread) return res.status(404).json({ message: 'Conversation not found' });
    res.json(thread);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /admin/support/:id/reopen — closing was a judgement call, not a lock.
const reopenSupport = async (req, res) => {
  try {
    const thread = await SupportMessage.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Conversation not found' });
    const last = thread.messages[thread.messages.length - 1];
    thread.status = last && last.from === 'admin' ? 'answered' : 'open';
    await thread.save();
    const populated = await SupportMessage.findById(thread._id).populate('userId', 'name email phone');
    res.json(populated);
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
module.exports.reopenSupport = reopenSupport;
