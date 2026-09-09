// Run this with: npm run seed
// (Or press the "Load Sample Data" button on the admin dashboard - same thing.)
// It fills the database with 150 donors, 110 hospitals/blood banks,
// 3 doctors per hospital (330 doctors), and 16 blog articles.

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const runSeed = require('./seedRunner');

const run = async () => {
  await connectDB();
  console.log('Seeding sample data...');
  const counts = await runSeed();
  console.log(`Created: ${counts.donors} donors, ${counts.hospitals} hospitals, ${counts.doctors} doctors, ${counts.blogs} blog articles.`);
  console.log('Sample login: donor1@example.com / password123  |  Admin: admin@healthplatform.com / password123');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });
