// This is the entry point of the backend. Run it with: npm run dev

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB before anything else
connectDB().then(async () => {
  // AUTO-SEED: if the database has no blog articles yet (fresh/empty database),
  // load all sample data automatically on startup - no button or cmd needed.
  // Once articles exist, this never runs again, so data is NOT reset on restarts.
  try {
    const Blog = require('./models/Blog');
    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      console.log('Empty database detected - loading sample data automatically...');
      const runSeed = require('./seed/seedRunner');
      const counts = await runSeed();
      console.log(`Auto-seed done: ${counts.donors} donors, ${counts.hospitals} hospitals, ${counts.doctors} doctors, ${counts.blogs} blogs.`);
    }
  } catch (e) {
    console.error('Auto-seed failed:', e.message);
  }
});

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
// limit raised to 5mb because blog cover images are sent as base64 data URLs
app.use(express.json({ limit: '5mb' }));

// Serve generated QR code images as static files (e.g. /qrcodes/<userId>.png)
app.use('/qrcodes', express.static(path.join(__dirname, 'public', 'qrcodes')));

// Routes - every feature/module gets its own route file
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/emergency', require('./routes/emergencyRoutes')); // PUBLIC route lives here
app.use('/api/donors', require('./routes/donorRoutes'));
app.use('/api/hospitals', require('./routes/hospitalRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/donation-requests', require('./routes/donationRequestRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/stats', require('./routes/statsRoutes')); // live dashboard stats // reading is public, writing is admin-only
app.use('/api/admin', require('./routes/adminRoutes')); // admin-only utilities (reload sample data)

// Simple health check route, useful to confirm the server is running
app.get('/', (req, res) => {
  res.json({ message: 'Health Emergency & Blood Donor Assistance Platform API is running' });
});

// Catch-all error handler (last piece of middleware)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
