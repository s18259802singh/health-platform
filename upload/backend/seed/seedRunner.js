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

const hospitalData = require('./hospitalData');
const donorData = require('./donorData');
const blogData = require('./blogData');

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

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Make sure the default admin exists (created only if missing).
  const adminExists = await User.findOne({ email: 'admin@healthplatform.com' });
  if (!adminExists) {
    await User.create({
      name: 'Admin User',
      email: 'admin@healthplatform.com',
      password: hashedPassword,
      phone: '9000000000',
      bloodGroup: 'O+',
      allergies: 'None',
      emergencyContact: { name: 'Office', number: '9000000001' },
      isDonor: false,
      role: 'admin',
      location: 'Surat',
    });
  }

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

  // Hospitals
  const hospitals = await Hospital.insertMany(hospitalData);

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

  return {
    donors: createdDonors.length,
    hospitals: hospitals.length,
    doctors: createdDoctors.length,
    blogs: blogs.length,
  };
};

module.exports = runSeed;
