// Run this ONCE with: npm run seed
// It fills your database with sample users, hospitals, and doctors,
// so your demo/report screenshots look realistic instead of empty.

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');

const run = async () => {
  await connectDB();

  console.log('Clearing old sample data...');
  await User.deleteMany({});
  await Hospital.deleteMany({});
  await Doctor.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  console.log('Creating users (1 admin + donors)...');
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const cities = ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot'];

  const users = [
    {
      name: 'Admin User', email: 'admin@healthplatform.com', password: hashedPassword,
      phone: '9000000000', bloodGroup: 'O+', allergies: 'None',
      emergencyContact: { name: 'Office', number: '9000000001' },
      isDonor: false, role: 'admin', location: 'Surat',
    },
  ];

  for (let i = 1; i <= 12; i++) {
    users.push({
      name: `Donor User ${i}`,
      email: `donor${i}@example.com`,
      password: hashedPassword,
      phone: `90000000${10 + i}`,
      bloodGroup: bloodGroups[i % bloodGroups.length],
      allergies: i % 3 === 0 ? 'Penicillin' : 'None',
      emergencyContact: { name: `Family Contact ${i}`, number: `90000001${10 + i}` },
      isDonor: true,
      role: 'user',
      location: cities[i % cities.length],
    });
  }

  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} users. Sample login: donor1@example.com / password123`);

  console.log('Creating hospitals...');
  const hospitals = await Hospital.insertMany([
    { name: 'City Care Hospital', address: 'Ring Road, Surat', contactNumber: '02611234567', type: 'hospital' },
    { name: 'LifeLine Blood Bank', address: 'Adajan, Surat', contactNumber: '02617654321', type: 'blood_bank' },
    { name: 'Sunrise Multispeciality Hospital', address: 'Vesu, Surat', contactNumber: '02619988776', type: 'hospital' },
  ]);
  console.log(`Created ${hospitals.length} hospitals.`);

  console.log('Creating doctors...');
  await Doctor.insertMany([
    { name: 'Dr. Ansari', specialization: 'Cardiologist', hospitalId: hospitals[0]._id, availableDays: ['Monday', 'Wednesday', 'Friday'], availableTimeSlots: ['10:00 AM', '11:00 AM', '4:00 PM'] },
    { name: 'Dr. Mehta', specialization: 'General Physician', hospitalId: hospitals[0]._id, availableDays: ['Tuesday', 'Thursday'], availableTimeSlots: ['9:00 AM', '12:00 PM'] },
    { name: 'Dr. Patel', specialization: 'Orthopedic', hospitalId: hospitals[2]._id, availableDays: ['Monday', 'Saturday'], availableTimeSlots: ['11:00 AM', '2:00 PM'] },
  ]);
  console.log('Sample data created successfully.');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
