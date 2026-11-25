// SERVER-SIDE VALIDATION
//
// The same rules the browser applies in frontend/src/lib/validate.js, with
// the same wording, so a person who bypasses the form — or reaches the API
// another way — gets the same answer rather than a 500 from Mongoose.
//
// Controllers call `check(values, schema)` and get back a map of
// field -> message. An empty map means the input is fine. The 400 response
// shape is { message, errors }, which is what the browser's useForm hook
// reads to put each message back on its own field.

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const trim = (v) => (typeof v === 'string' ? v.trim() : v);

const rules = {
  required: (label = 'This') => (v) =>
    (trim(v) === '' || v == null ? `${label} is required` : ''),

  name: (v) => {
    const s = trim(v) || '';
    if (!s) return 'Enter a name';
    if (s.length < 2) return 'That name looks too short';
    if (s.length > 60) return 'Keep the name under 60 characters';
    return '';
  },

  email: (v) => {
    const s = (trim(v) || '').toLowerCase();
    if (!s) return 'Enter an email address';
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(s)) return 'Enter a complete email address, like you@example.com';
    if (s.length > 120) return 'That email address is too long';
    return '';
  },

  phone: (v) => {
    const s = (trim(v) || '').replace(/[\s-()]/g, '');
    if (!s) return 'Enter a mobile number';
    const digits = s.replace(/^\+?91/, '').replace(/^0/, '');
    if (!/^\d+$/.test(digits)) return 'Use digits only';
    if (digits.length !== 10) return 'Enter a 10-digit mobile number';
    if (!/^[6-9]/.test(digits)) return 'An Indian mobile number starts with 6, 7, 8 or 9';
    return '';
  },

  anyPhone: (v) => {
    const s = (trim(v) || '').replace(/[\s-()]/g, '');
    if (!s) return 'Enter a contact number';
    const digits = s.replace(/^\+?91/, '');
    if (!/^\d+$/.test(digits)) return 'Use digits only';
    if (digits.length < 8 || digits.length > 12) return 'That does not look like a phone number';
    return '';
  },

  password: (v) => {
    const s = v || '';
    if (!s) return 'Choose a password';
    if (s.length < 8) return 'Use at least 8 characters';
    if (s.length > 72) return 'Keep the password under 72 characters';
    if (!/[a-zA-Z]/.test(s)) return 'Include at least one letter';
    if (!/\d/.test(s)) return 'Include at least one number';
    return '';
  },

  bloodGroup: (v) => {
    if (!v) return 'Choose a blood group';
    return GROUPS.includes(v) ? '' : 'Choose a valid blood group';
  },

  place: (v) => {
    const s = trim(v) || '';
    if (!s) return 'Enter a town or city';
    if (s.length < 2) return 'That is too short to be a place';
    if (s.length > 80) return 'Keep it under 80 characters';
    return '';
  },

  text: ({ label = 'This', min = 0, max = 300, optional = false } = {}) => (v) => {
    const s = trim(v) || '';
    if (!s) return optional ? '' : `${label} is required`;
    if (s.length < min) return `${label} needs at least ${min} characters`;
    if (s.length > max) return `Keep ${label.toLowerCase()} under ${max} characters`;
    return '';
  },

  number: ({ label = 'This', min = -Infinity, max = Infinity, integer = true, optional = false } = {}) => (v) => {
    if (v === '' || v == null) return optional ? '' : `${label} is required`;
    const n = Number(v);
    if (!Number.isFinite(n)) return `${label} must be a number`;
    if (integer && n % 1 !== 0) return `${label} must be a whole number`;
    if (n < min) return `${label} cannot be less than ${min}`;
    if (n > max) return `${label} cannot be more than ${max}`;
    return '';
  },

  oneOf: (list, label = 'This') => (v) =>
    (list.includes(v) ? '' : `${label} must be one of: ${list.join(', ')}`),

  isoDate: ({ label = 'Date', optional = false } = {}) => (v) => {
    if (!v) return optional ? '' : `${label} is required`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return `${label} must be in YYYY-MM-DD form`;
    const d = new Date(`${v}T00:00:00`);
    if (Number.isNaN(d.getTime())) return `${label} is not a real date`;
    return '';
  },

  all: (...fns) => (v, all) => {
    for (const fn of fns) { const m = fn(v, all); if (m) return m; }
    return '';
  },

  optional: (fn) => (v, all) => (trim(v) === '' || v == null ? '' : fn(v, all)),
};

// Returns { field: message } for the fields that failed.
const check = (values, schema) => {
  const errors = {};
  Object.entries(schema || {}).forEach(([field, rule]) => {
    const msg = typeof rule === 'function' ? rule(values[field], values) : '';
    if (msg) errors[field] = msg;
  });
  return errors;
};

// Shorthand for the 400 every controller sends on bad input.
const fail = (res, errors, message = 'Please correct the highlighted fields') =>
  res.status(400).json({ message, errors });

module.exports = { rules, check, fail, GROUPS };
