// Creates (or promotes) an administrator account from the command line.
//
//   node scripts/createAdmin.js "Admin Name" admin@example.com StrongPassword123 07700900000
//
// If the email already exists, the account is promoted to admin and its
// password is reset to the one given. Run it once after deploying.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  const [name, email, password, phone] = process.argv.slice(2);
  if (!name || !email || !password) {
    console.error('Usage: node scripts/createAdmin.js "Name" email password [phone]');
    process.exit(1);
  }

  await connectDB();
  const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));
  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    existing.role = 'admin';
    existing.password = hashed;
    await existing.save();
    console.log(`Promoted ${existing.email} to administrator and reset the password.`);
  } else {
    await User.create({
      name,
      email,
      password: hashed,
      phone: phone || '0000000000',
      bloodGroup: 'O+',
      emergencyContact: { name, number: phone || '0000000000' },
      role: 'admin',
      isDonor: false,
      location: '',
    });
    console.log(`Administrator ${email} created.`);
  }

  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
