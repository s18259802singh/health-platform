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
const SupportMessage = require('../models/SupportMessage');

const hospitalData = require('./hospitalData');
const hospitalDataIndia = require('./hospitalDataIndia');
const donorData = require('./donorData');
const donorDataIndia = require('./donorDataIndia');
const blogData = require('./blogData');
const campData = require('./campData');
const storyData = require('./storyData');
const guideData = require('./guideData');
const requestData = require('./requestData');
const { resolveRegion, tidyAddress } = require('./regionMap');
const { stockFor } = require('./stockModel');

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
  await SupportMessage.deleteMany({});

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
  // Spread the join dates over the past few months rather than stamping the
  // whole register with "now". A fresh seed otherwise produced a dashboard
  // whose signup chart was a flat zero line and whose "new in 14 days" count
  // read 0 with 385 members on the books, which looks broken.
  const JOIN_SPREAD_DAYS = 150;
  const joinedAt = (i, total) => {
    // Weighted towards recent weeks, so the trend line rises rather than
    // being uniform noise, and roughly a tenth land inside the last fortnight.
    const share = (i + 1) / total;
    const daysAgo = Math.round(JOIN_SPREAD_DAYS * (1 - share ** 0.6));
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(9 + (i % 10), (i * 7) % 60, 0, 0);
    return d;
  };

  const allDonorRows = [...donorData, ...donorDataIndia];
  const donors = allDonorRows.map((d, i) => ({
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
    createdAt: joinedAt(i, allDonorRows.length),
  }));
  const createdDonors = await User.insertMany(donors);

  // Hospitals.
  // hospitalData.js is a plain directory - name, address, phone, type - so two
  // things are added here rather than making whoever maintains that list
  // retype 110 rows:
  //   1) city/district/state, looked up from the address via regionMap so the
  //      availability search can group by a real district (deriving it from
  //      the last comma-separated token used to produce a district called
  //      "Gujarat" and filed towns as districts of themselves);
  //   2) availableBloodUnits, built by stockModel. Without this every centre
  //      reported 0 units and the public availability portal - the main
  //      feature - read "Out of stock" on all 110 rows.
  // The Gujarat rows carry their region only inside the address string, so it
  // is looked up; the national rows already state city, district and state,
  // so those are trusted as given rather than re-derived from prose.
  const allCentres = [...hospitalData, ...hospitalDataIndia];
  const withRegion = allCentres.map((h) => {
    const looked = resolveRegion(h.address);
    return {
      ...h,
      address: tidyAddress(h.address),
      city: h.city || looked.city,
      district: h.district || looked.district,
      state: h.state || 'Gujarat',
      availableBloodUnits: stockFor(h),
    };
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
  // long tail with one or two. Dates within a donor are spaced at least 90
  // days apart, matching the real interval between whole blood donations.
  //
  // The FIRST gap varies per person (firstGap below). It used to be a flat 20
  // days for everyone, which meant every donor's most recent donation landed
  // on the same timestamp and the leaderboard showed one identical "last
  // donated" date down the whole table.
  const buildHistory = (person, i, count) => {
    const docs = [];
    const firstGap = 6 + ((i * 37) % 168);   // 6 - 173 days since last donation
    for (let n = 0; n < count; n += 1) {
      const daysAgo = firstGap + n * (92 + (i % 11));
      const when = new Date();
      when.setDate(when.getDate() - daysAgo);
      when.setHours(8 + ((i + n) % 9), (i * 7 + n * 13) % 60, 0, 0);
      const hospital = hospitals[(i + n) % hospitals.length];
      docs.push({
        userId: person._id,
        donatedAt: when,
        bloodGroup: person.bloodGroup || 'O+',
        units: 1,
        hospitalId: hospital?._id,
        locationName: hospital?.name || '',
        certificateNo: `LL-${when.getFullYear()}-${(i * 101 + n * 7).toString(36).toUpperCase().padStart(5, '0').slice(-5)}`,
      });
    }
    return docs;
  };

  const donationDocs = [];
  createdDonors.forEach((donor, i) => {
    // roughly 55% of donors have given at least once
    if (i % 9 === 0) return;
    const count = i % 23 === 0 ? 18 + (i % 9)
      : i % 11 === 0 ? 9 + (i % 5)
      : i % 5 === 0 ? 4 + (i % 4)
      : 1 + (i % 3);
    donationDocs.push(...buildHistory(donor, i, count));
  });

  // Admin accounts survive a re-seed, and the admin account is what gets
  // handed over for a demo. Without this, "My donations" and the dashboard
  // donor-status tile read "0 donations" for the one person actually signing
  // in, while the leaderboard beside it showed hundreds.
  const admins = await User.find({ role: 'admin' }).select('_id bloodGroup name phone');
  admins.forEach((admin, k) => {
    donationDocs.push(...buildHistory(admin, 900 + k * 13, 7 + k));
  });

  // Certificates are issued by an administrator, not minted automatically.
  // Historical donations arrive already issued - they are history. The most
  // recent handful are left pending on purpose, so the issuing queue in the
  // console is not an empty screen nobody ever looks at.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 45);
  donationDocs.forEach((d) => {
    const issued = d.donatedAt < cutoff;
    d.certificateIssued = issued;
    if (issued) d.certificateIssuedAt = new Date(d.donatedAt.getTime() + 2 * 86400000);
  });
  const donations = await Donation.insertMany(donationDocs, { ordered: false });

  // Put each admin on an upcoming camp too, so "My camps" on the dashboard
  // has a row rather than an empty state.
  const upcomingForAdmins = camps.filter((c) => c.status === 'upcoming').slice(0, 2);
  for (const camp of upcomingForAdmins) {
    admins.forEach((admin) => {
      const already = camp.registrations.some((r) => String(r.userId) === String(admin._id));
      if (already) return;
      camp.registrations.push({
        userId: admin._id,
        name: admin.name,
        phone: admin.phone || '',
        bloodGroup: admin.bloodGroup || 'O+',
        registeredAt: new Date(Date.now() - 3 * 86400000),
      });
    });
    await camp.save();
  }

  // ---- Appointments ----
  // Without these the console's Appointments page is empty on a fresh
  // database, which reads as a broken feature rather than a quiet week.
  const apptDocs = [];
  const SLOT_TIMES = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];
  const APPT_STATUS = ['confirmed', 'confirmed', 'pending', 'confirmed', 'pending', 'cancelled'];
  const isoDay = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  createdDoctors.slice(0, 40).forEach((doctor, i) => {
    const patient = createdDonors[(i * 7 + 3) % createdDonors.length];
    if (!patient) return;
    apptDocs.push({
      userId: patient._id,
      doctorId: doctor._id,
      // A spread either side of today, so the page shows a past week and a
      // booked-up week rather than one clump.
      appointmentDate: isoDay(((i % 14) - 5)),
      appointmentTime: SLOT_TIMES[i % SLOT_TIMES.length],
      status: APPT_STATUS[i % APPT_STATUS.length],
    });
  });
  const appointments = await Appointment.insertMany(apptDocs);

  // ---- Blood requests (the public requests board) ----
  // requestData holds an index into donorData; swap it for the real user so
  // the board can populate a name and a contact number.
  const requestDocs = requestData
    .map(({ donorIndex, hoursAgo, closedHoursAgo, status, ...rest }) => {
      const requester = createdDonors[donorIndex];
      if (!requester) return null;
      const when = new Date(Date.now() - hoursAgo * 3600000);
      // A closed request needs the date it closed, not just the date it was
      // raised — the board shows both, and "fulfilled, no date" reads as a bug.
      const closed = closedHoursAgo != null
        ? new Date(Date.now() - closedHoursAgo * 3600000)
        : null;
      return {
        ...rest,
        status,
        requesterId: requester._id,
        fulfilledAt: status === 'fulfilled' ? closed : null,
        cancelledAt: status === 'cancelled' ? closed : null,
        createdAt: when,
        updatedAt: closed || when,
      };
    })
    .filter(Boolean);
  const requests = await DonationRequest.insertMany(requestDocs);

  // ---- Live chat ----
  // Three conversations so the console shows each state the inbox can be in:
  // one waiting on an answer, one with a reply and a follow-up question after
  // it, and one that was dealt with and closed.
  const hrs = (n) => new Date(Date.now() - n * 3600000);
  // Seeded replies are attributed to a real admin if one exists; the script
  // creates none of its own, so on a fresh database there may be nobody.
  const replier = admins[0];

  const supportSeed = [
    {
      name: 'Rupal Mehta', contact: '9876543210', page: '/camps', status: 'open',
      messages: [
        { from: 'visitor', body: 'I am on blood pressure tablets. Can I still donate at the camp on the 19th?', at: hrs(5) },
      ],
      lastMessageAt: hrs(5), createdAt: hrs(5),
    },
    {
      name: 'Kalpesh Patel', contact: 'kalpesh@example.com', page: '/availability', status: 'open',
      messages: [
        { from: 'visitor', body: 'My father needs two units of B negative in Rajkot tomorrow. Does the portal hold them for us?', at: hrs(26) },
        { from: 'admin', byId: replier?._id, byName: replier?.name || 'LifeLink team',
          body: 'The portal shows what each centre has recorded but cannot reserve units — call the centre directly and they will hold them against the patient name. Sterling Hospital Rajkot had B negative in stock this morning.',
          at: hrs(20) },
        { from: 'visitor', body: 'Thank you. If they have none left, which centre is nearest to Rajkot that might?', at: hrs(2) },
      ],
      lastMessageAt: hrs(2), createdAt: hrs(26),
    },
    {
      name: 'Visitor', contact: '', page: '/donors', status: 'closed',
      messages: [
        { from: 'visitor', body: 'Why can I not see donor phone numbers?', at: hrs(70) },
        { from: 'admin', byId: replier?._id, byName: replier?.name || 'LifeLink team',
          body: 'Contact numbers are shown to signed-in members only, and only for donors who opted in. Register (it is free) and they appear on the donor cards.',
          at: hrs(69) },
      ],
      lastMessageAt: hrs(69), createdAt: hrs(70),
    },
  ].map((m, i) => ({ ...m, threadKey: `seed${i}${Math.random().toString(36).slice(2, 10)}` }));
  const support = await SupportMessage.insertMany(supportSeed);

  return {
    donors: createdDonors.length,
    hospitals: hospitals.length,
    doctors: createdDoctors.length,
    blogs: blogs.length,
    camps: camps.length,
    stories: stories.length,
    guides: guides.length,
    donations: donations.length,
    requests: requests.length,
    appointments: appointments.length,
    support: support.length,
    certificatesIssued: donationDocs.filter((d) => d.certificateIssued).length,
    certificatesPending: donationDocs.filter((d) => !d.certificateIssued).length,
    bloodUnits: withRegion.reduce((a, h) => a + h.availableBloodUnits.reduce((x, u) => x + u.units, 0), 0),
  };
};

module.exports = runSeed;
