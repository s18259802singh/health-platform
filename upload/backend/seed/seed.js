// Run this ONCE with: npm run seed
// It fills your database with sample users, hospitals, and doctors,
// so your demo/report screenshots look realistic instead of empty.
//
// Hospitals: real hospitals/blood banks in Gujarat (public directories, Sept 2026).
// Donors: FICTIONAL sample people, for demo purposes only.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');

const hospitalData = require('./hospitalData');
const donorData = require('./donorData');

const doctorFirstNames = ['Ansari', 'Mehta', 'Patel', 'Shah', 'Desai', 'Trivedi', 'Joshi', 'Rao', 'Iyer', 'Kapoor'];
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

const run = async () => {
  await connectDB();

  console.log('Clearing old sample data...');
  await User.deleteMany({});
  await Hospital.deleteMany({});
  await Doctor.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  // --- Users: 1 admin + fictional donors ---
  console.log('Creating users (1 admin + donors)...');
  const users = [
    {
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
    },
  ];

  for (const d of donorData) {
    users.push({
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
    });
  }

  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} users (${createdUsers.length - 1} donors). Sample login: donor1@example.com / password123`);

  // --- Hospitals: real Gujarat hospitals/blood banks ---
  console.log('Creating hospitals...');
  const hospitals = await Hospital.insertMany(hospitalData);
  console.log(`Created ${hospitals.length} hospitals.`);

  // --- Doctors: a couple per hospital, cycling through sample names/specializations ---
  console.log('Creating doctors...');
  const doctors = [];
  hospitals.forEach((hospital, hIdx) => {
    const doctorsPerHospital = 2;
    for (let j = 0; j < doctorsPerHospital; j++) {
      const idx = (hIdx * doctorsPerHospital + j);
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
  console.log(`Created ${createdDoctors.length} doctors.`);

  console.log('Sample data created successfully.');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
