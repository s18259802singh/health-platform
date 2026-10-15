// This middleware checks if a request has a valid JWT token.
// It runs BEFORE any "protected" controller (like Profile, Appointments, Hospital admin CRUD).
// The Emergency QR route deliberately does NOT use this middleware, so it stays public.

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, role } - available to every controller after this
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token is invalid or expired' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token provided' });
};

// Use this AFTER protect() on routes only an admin should reach.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access only' });
};

module.exports = { protect, adminOnly };
