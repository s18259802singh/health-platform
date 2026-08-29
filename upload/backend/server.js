// This is the entry point of the backend. Run it with: npm run dev

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB before anything else
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json()); // lets us read JSON from req.body

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
