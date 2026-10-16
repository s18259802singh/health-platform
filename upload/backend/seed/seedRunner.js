// The actual seeding logic, shared by two callers:
//   1) `npm run seed` (seed/seed.js - command line)
//   2) POST /api/admin/seed (the "Load Sample Data" button on the admin dashboard)
//
// It clears and recreates sample data: donors, hospitals, doctors and blog
// articles. Admin accounts are KEPT (so the admin pressing the button stays
// logged in). Old appointments and donation requests are cleared too, because
// they point at users/doctors that no longer exist after a reseed.

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Blog = require('../models/Blog');
const Appointment = require('../models/Appointment');
const DonationRequest = require('../models/DonationRequest');
const Camp = require('../models/Camp');
const Story = require('../models/Story');
const Guide = require('../models/Guide');
const Donation = require('../models/Donation');

const hospitalData = require('./hospitalData');
const donorData = require('./donorData');
const blogData = require('./blogData');
const campData = require('./campData');
const storyData = require('./storyData');
const guideData = require('./guideData');

const doctorFirstNames = ['Ansari', 'Mehta', 'Patel', 'Shah', 'Desai', 'Trivedi', 'Joshi', 'Rao', 'Iyer', 'Kapoor', 'Solanki', 'Vyas', 'Pandya', 'Bhatt'];
const specializations = ['Cardiologist', 'General Physician', 'Orthopedic', 'Dermatologist', 'Pediatrician', 'ENT Specialist', 'Gynecologist', 'Neurologist'];
const dayCombos = [
  ['Monday', 'Wednesday', 'Friday'],
  ['Tuesday', 'Thursday'],
  ['Monday', 'Saturday'],
  ['Wednesday', 'Friday', 'Saturday'],
];
const timeCombos = [
  ['10:00 AM', '11:00 AM', '4:00 PM'],
  ['9:00 AM', '12:00 PM'],
  ['11:00 AM', '2:00 PM'],
  ['3:00 PM', '5:00 PM'],
];

const runSeed = async () => {
  // Clear old sample data. Admins are kept so the logged-in admin survives.
  await User.deleteMany({ role: { $ne: 'admin' } });
  await Hospital.deleteMany({});
  await Doctor.deleteMany({});
  await Blog.deleteMany({});
  await Appointment.deleteMany({});
  await DonationRequest.deleteMany({});
  await Camp.deleteMany({});
  await Story.deleteMany({});
  await Guide.deleteMany({});
  await Donation.deleteMany({});

  // Password for the SAMPLE DONOR accounts only.
  // Set SEED_DEMO_PASSWORD in the environment to change it; if it is not set,
  // a random one is generated and nobody can sign in as a sample donor.
  const demoPassword = process.env.SEED_DEMO_PASSWORD
    || `seed-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  const hashedPassword = await bcrypt.hash(demoPassword, 10);

  // NOTE: this script deliberately creates NO administrator account.
  // A hard-coded admin email and password in source control is a way in for
  // anyone who can read the repository. Create admins instead with either:
  //   - scripts/createAdmin.js  (command line), or
  //   - the Members page of the admin console (promote an existing account).
  // Existing admin accounts are never deleted by this script, so re-seeding
  // will not lock you out.

  // Donors
  const donors = donorData.map((d) => ({
    name: d.name,
    email: d.email,
    password: hashedPassword,
    phone: d.phone,
    bloodGroup: d.bloodGroup,
    allergies: d.allergies,
    emergencyContact: { name: d.emergencyContactName, number: d.emergencyContactNumber },
    isDonor: d.isDonor,
    role: 'user',
    location: d.location,
  }));
  const createdDonors = await User.insertMany(donors);

  // Hospitals.
  // The directory addresses end with the district, e.g. "... , Bilimora, Navsari".
  // The availability search needs those as real fields, so derive them here
  // rather than asking whoever maintains the list to retype every row.
  const withRegion = hospitalData.map((h) => {
    const parts = String(h.address || '').split(',').map((x) => x.trim()).filter(Boolean);
    const district = (parts[parts.length - 1] || '').replace(/\s*-\s*\d{6}$/, '').replace(/\s+District$/i, '').trim();
    const city = (parts.length > 1 ? parts[parts.length - 2] : district).replace(/\s*-\s*\d{6}$/, '').trim();
    return { ...h, district: district || 'Other', city: city || district || 'Other', state: h.state || 'Gujarat' };
  });
  const hospitals = await Hospital.insertMany(withRegion);

  // Doctors - 3 per hospital, so the appointment dropdowns always have options.
  const doctors = [];
  hospitals.forEach((hospital, hIdx) => {
    const doctorsPerHospital = 3;
    for (let j = 0; j < doctorsPerHospital; j++) {
      const idx = hIdx * doctorsPerHospital + j;
      doctors.push({
        name: `Dr. ${doctorFirstNames[idx % doctorFirstNames.length]}`,
        specialization: specializations[idx % specializations.length],
        hospitalId: hospital._id,
        availableDays: dayCombos[idx % dayCombos.length],
        availableTimeSlots: timeCombos[idx % timeCombos.length],
      });
    }
  });
  const createdDoctors = await Doctor.insertMany(doctors);

  // Blog articles
  const blogs = await Blog.insertMany(blogData);

  // ---- Donor stories and the guide library (straight inserts) ----
  const stories = await Story.insertMany(storyData);
  const guides = await Guide.insertMany(guideData);

  // ---- Camps ----
  // campData stores an offset so the list is never stale; turn it into a date.
  const isoDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  };

  const campDocs = campData.map(({ daysFromNow, status, ...rest }) => ({
    ...rest,
    date: isoDate(daysFromNow),
    status: status || 'upcoming',
  }));
  const camps = await Camp.insertMany(campDocs);

  // Fill upcoming camps to a believable 35-80% of capacity using real donors,
  // so the slot counters on the public site are not all showing zero.
  for (const camp of camps) {
    if (camp.status !== 'upcoming') continue;
    const take = Math.floor(camp.slots * (0.35 + Math.random() * 0.45));
    const picked = [...createdDonors].sort(() => Math.random() - 0.5).slice(0, take);
    camp.registrations = picked.map((d) => ({
      userId: d._id, name: d.name, phone: d.phone, bloodGroup: d.bloodGroup,
      registeredAt: new Date(Date.now() - Math.random() * 12 * 86400000),
    }));
    await camp.save();
  }

  // ---- Donation history (drives the leaderboard and certificates) ----
  // A realistic spread: a few long-standing donors with many donations, a
  // long tail with one or two. Dates are spaced at least 90 days apart,
  // matching the real interval between whole blood donations.
  const donationDocs = [];
  createdDonors.forEach((donor, i) => {
    // roughly 55% of donors have given at least once
    if (i % 9 === 0) return;
    const count = i % 23 === 0 ? 18 + (i % 9)
      : i % 11 === 0 ? 9 + (i % 5)
      : i % 5 === 0 ? 4 + (i % 4)
      : 1 + (i % 3);

    for (let n = 0; n < count; n += 1) {
      const daysAgo = 20 + n * (92 + (i % 11));
      const when = new Date();
      when.setDate(when.getDate() - daysAgo);
      const hospital = hospitals[(i + n) % hospitals.length];
      donationDocs.push({
        userId: donor._id,
        donatedAt: when,
        bloodGroup: donor.bloodGroup,
        units: 1,
        hospitalId: hospital?._id,
        locationName: hospital?.name || '',
        certificateNo: `LL-${when.getFullYear()}-${(i * 101 + n * 7).toString(36).toUpperCase().padStart(5, '0').slice(-5)}`,
      });
    }
  });
  const donations = await Donation.insertMany(donationDocs, { ordered: false });

  return {
    donors: createdDonors.length,
    hospitals: hospitals.length,
    doctors: createdDoctors.length,
    blogs: blogs.length,
    camps: camps.length,
    stories: stories.length,
    guides: guides.length,
    donations: donations.length,
  };
};

module.exports = runSeed;
