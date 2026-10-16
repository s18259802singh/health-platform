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

// Attaches req.user when a valid token is present and carries on regardless.
// For routes that are open to everyone but behave better when they know who
// is asking — the support chat is the case this was written for: a visitor
// can ask a question without an account, and a signed-in member's question is
// filed against their record so they can find the answer later.
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch {
      // An expired token on an open route is not an error - just anonymous.
    }
  }
  return next();
};

module.exports = { protect, adminOnly, optionalAuth };
