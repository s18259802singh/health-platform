// Handles: Register and Login.
// Passwords are never stored as plain text - bcrypt turns them into a "hash" first.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// helper: creates a signed JWT token for a user
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const {
      name, email, password, phone, bloodGroup, allergies,
      emergencyContactName, emergencyContactNumber, isDonor, location,
    } = req.body;

    if (!name || !email || !password || !phone || !bloodGroup || !emergencyContactName || !emergencyContactNumber) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // hash the password before saving (10 = "salt rounds", a standard secure value)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      bloodGroup,
      allergies: allergies || 'None',
      emergencyContact: { name: emergencyContactName, number: emergencyContactNumber },
      isDonor: !!isDonor,
      location: location || '',
    });

    // Generate the emergency QR code for this user.
    // The QR just encodes a URL that opens the PUBLIC emergency info page for this user id.
        const emergencyUrl = `${process.env.CLIENT_URL}/emergency/${user._id}`;
    const qrDataUrl = await QRCode.toDataURL(emergencyUrl);

    user.qrCodePath = qrDataUrl;
    await user.save();

    const token = generateToken(user);
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, qrCodePath: user.qrCodePath },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // bcrypt.compare checks the plain password against the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, qrCodePath: user.qrCodePath },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

module.exports = { registerUser, loginUser };
