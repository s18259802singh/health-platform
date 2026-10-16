// ============================================================================
// ADMIN CONTROLLER
// ----------------------------------------------------------------------------
// Every endpoint in this file belongs to the SEPARATE admin panel.
// None of it is reachable from the public/user side of the app: each route is
// mounted behind protect + adminOnly in routes/adminRoutes.js, and the admin
// panel signs in through its own endpoint (adminLogin) with its own token,
// stored under its own key in the browser.
// ============================================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Blog = require('../models/Blog');
const DonationRequest = require('../models/DonationRequest');
const Appointment = require('../models/Appointment');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const signAdminToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, scope: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '1d', // shorter than the user token on purpose - admin sessions are higher risk
  });

// ---------------------------------------------------------------------------
// POST /api/admin/login   (PUBLIC entry point for the admin panel only)
// Same credentials check as the user login, but it refuses anyone whose role
// is not 'admin' - so a normal user cannot get an admin token even with the
// correct password.
// ---------------------------------------------------------------------------
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'This account does not have administrator access' });
    }

    res.json({
      message: 'Welcome back',
      token: signAdminToken(user),
      admin: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during admin login', error: error.message });
  }
};

// GET /api/admin/me - lets the panel re-validate a stored token on refresh
const getMe = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select('name email role createdAt');
    if (!admin) return res.status(404).json({ message: 'Admin account not found' });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/overview - everything the admin dashboard needs, in one call
// ---------------------------------------------------------------------------
const getOverview = async (req, res) => {
  try {
    const [
      totalUsers, totalDonors, totalAdmins,
      totalHospitals, totalBloodBanks, totalDoctors, totalBlogs,
      pendingRequests, fulfilledRequests,
      totalAppointments, pendingAppointments,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isDonor: true }),
      User.countDocuments({ role: 'admin' }),
      Hospital.countDocuments({ type: 'hospital' }),
      Hospital.countDocuments({ type: 'blood_bank' }),
      Doctor.countDocuments(),
      Blog.countDocuments(),
      DonationRequest.countDocuments({ status: 'pending' }),
      DonationRequest.countDocuments({ status: 'fulfilled' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
    ]);

    // Donors vs open requests, per blood group - the shortage picture.
    const [donorAgg, requestAgg] = await Promise.all([
      User.aggregate([{ $match: { isDonor: true } }, { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }]),
      DonationRequest.aggregate([{ $match: { status: 'pending' } }, { $group: { _id: '$bloodGroupNeeded', count: { $sum: 1 } } }]),
    ]);

    const bloodGroups = BLOOD_GROUPS.map((g) => ({
      group: g,
      donors: donorAgg.find((d) => d._id === g)?.count || 0,
      pendingRequests: requestAgg.find((r) => r._id === g)?.count || 0,
    }));

    // Signups over the last 14 days, for the trend chart.
    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);

    const signupAgg = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]);

    const signupTrend = [];
    for (let i = 0; i < 14; i += 1) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      signupTrend.push({ date: key, count: signupAgg.find((s) => s._id === key)?.count || 0 });
    }

    // Where the donors actually are.
    const topCities = await User.aggregate([
      { $match: { isDonor: true, location: { $nin: ['', null] } } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const [recentUsers, recentRequests] = await Promise.all([
      User.find().select('name email bloodGroup isDonor location createdAt').sort({ createdAt: -1 }).limit(6),
      DonationRequest.find().populate('requesterId', 'name phone').sort({ createdAt: -1 }).limit(6),
    ]);

    res.json({
      counts: {
        totalUsers, totalDonors, totalAdmins,
        totalHospitals, totalBloodBanks, totalDoctors, totalBlogs,
        pendingRequests, fulfilledRequests,
        totalAppointments, pendingAppointments,
      },
      bloodGroups,
      signupTrend,
      topCities: topCities.map((c) => ({ city: c._id, count: c.count })),
      recentUsers,
      recentRequests,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// USERS
// ---------------------------------------------------------------------------

// GET /api/admin/users?search=&bloodGroup=&role=&donor=&page=&limit=
const listUsers = async (req, res) => {
  try {
    const { search = '', bloodGroup = '', role = '', donor = '' } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(5, parseInt(req.query.limit, 10) || 20));

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (role) filter.role = role;
    if (donor === 'true') filter.isDonor = true;
    if (donor === 'false') filter.isDonor = false;

    const [items, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) || 1, limit });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/users/:id
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [requests, appointments] = await Promise.all([
      DonationRequest.find({ requesterId: user._id }).sort({ createdAt: -1 }).limit(10),
      Appointment.find({ userId: user._id })
        .populate({ path: 'doctorId', select: 'name specialization' })
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.json({ user, requests, appointments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/users/:id - admin edits a member record
const updateUser = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'bloodGroup', 'allergies', 'location', 'isDonor', 'role'];
    const payload = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    });

    if (req.body.emergencyContactName || req.body.emergencyContactNumber) {
      payload.emergencyContact = {
        name: req.body.emergencyContactName || '',
        number: req.body.emergencyContactNumber || '',
      };
    }

    // Guard: never let the last admin demote themselves out of existence.
    if (payload.role === 'user') {
      const target = await User.findById(req.params.id).select('role');
      if (target && target.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
          return res.status(400).json({ message: 'You cannot remove the last administrator account' });
        }
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/admin/users - admin creates an account (usually another admin)
const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, bloodGroup, location, isDonor, role } = req.body;
    if (!name || !email || !password || !phone || !bloodGroup) {
      return res.status(400).json({ message: 'name, email, password, phone and bloodGroup are required' });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(400).json({ message: 'An account with this email already exists' });

    const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      bloodGroup,
      location: location || '',
      isDonor: !!isDonor,
      role: role === 'admin' ? 'admin' : 'user',
      emergencyContact: {
        name: req.body.emergencyContactName || name,
        number: req.body.emergencyContactNumber || phone,
      },
    });

    const { password: _ignored, ...safe } = user.toObject();
    res.status(201).json(safe);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/admin/users/:id - also cleans up that member's records
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete the account you are signed in with' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'You cannot delete the last administrator account' });
      }
    }

    await Promise.all([
      DonationRequest.deleteMany({ requesterId: user._id }),
      Appointment.deleteMany({ userId: user._id }),
    ]);
    await user.deleteOne();

    res.json({ message: 'User and their records were deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// DONATION REQUESTS (moderation)
// ---------------------------------------------------------------------------

// GET /api/admin/requests?status=&bloodGroup=&search=
const listRequests = async (req, res) => {
  try {
    const { status = '', bloodGroup = '', search = '' } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (bloodGroup) filter.bloodGroupNeeded = bloodGroup;
    if (search) filter.location = { $regex: search, $options: 'i' };

    const items = await DonationRequest.find(filter)
      .populate('requesterId', 'name phone email location')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/requests/:id - admin can set any status
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'fulfilled', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'status must be pending, fulfilled or cancelled' });
    }
    const request = await DonationRequest.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('requesterId', 'name phone email location');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/admin/requests/:id
const deleteRequest = async (req, res) => {
  try {
    const request = await DonationRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// APPOINTMENTS
// ---------------------------------------------------------------------------

// GET /api/admin/appointments?status=&search=
const listAppointments = async (req, res) => {
  try {
    const { status = '' } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const items = await Appointment.find(filter)
      .populate('userId', 'name email phone')
      .populate({ path: 'doctorId', select: 'name specialization hospitalId', populate: { path: 'hospitalId', select: 'name' } })
      .sort({ appointmentDate: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/appointments/:id
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'status must be pending, confirmed or cancelled' });
    }
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('userId', 'name email phone')
      .populate({ path: 'doctorId', select: 'name specialization' });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/admin/appointments/:id
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// DOCTORS (full CRUD - the user side only ever reads this list)
// ---------------------------------------------------------------------------

const listDoctors = async (req, res) => {
  try {
    const { search = '', hospitalId = '' } = req.query;
    const filter = {};
    if (hospitalId) filter.hospitalId = hospitalId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }
    const items = await Doctor.find(filter).populate('hospitalId', 'name address').sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(await doctor.populate('hospitalId', 'name address'));
  } catch (error) {
    res.status(400).json({ message: 'Could not save doctor', error: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('hospitalId', 'name address');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ message: 'Could not update doctor', error: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    await Appointment.deleteMany({ doctorId: doctor._id });
    res.json({ message: 'Doctor and their appointments were deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  adminLogin, getMe, getOverview,
  listUsers, getUser, createUser, updateUser, deleteUser,
  listRequests, updateRequestStatus, deleteRequest,
  listAppointments, updateAppointmentStatus, deleteAppointment,
  listDoctors, createDoctor, updateDoctor, deleteDoctor,
};
