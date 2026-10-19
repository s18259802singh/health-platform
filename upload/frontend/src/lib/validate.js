// FORM VALIDATION
//
// One set of rules and one hook, used by every form on the site and in the
// console. Before this, each form checked whatever it felt like: some relied
// on the browser's `required`, some checked nothing and let the server say
// no, and the messages they produced were all worded differently.
//
// Three things this deliberately does:
//
//  1. It does not shout at somebody who is still typing. A field is only
//     marked wrong after it has been left (blurred), or after the form has
//     been submitted once. Validating on every keystroke means the form is
//     red before the first field is even finished.
//
//  2. The messages say what to do, not what went wrong. "Enter a 10-digit
//     mobile number" beats "Invalid phone".
//
//  3. It never replaces the server's checks. The same rules exist in the
//     controllers, because a form is not the only way into an API.

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const trim = (v) => (typeof v === 'string' ? v.trim() : v);

// --- individual rules ------------------------------------------------------
// Each returns a message when the value is wrong, or '' when it is fine.

export const rules = {
  required: (label = 'This') => (v) =>
    (trim(v) === '' || v == null || v === false ? `${label} is required` : ''),

  name: (v) => {
    const s = trim(v) || '';
    if (!s) return 'Enter a name';
    if (s.length < 2) return 'That name looks too short';
    if (s.length > 60) return 'Keep the name under 60 characters';
    if (!/^[\p{L}][\p{L}\p{M}'. -]*$/u.test(s)) return 'Use letters, spaces, apostrophes and full stops only';
    return '';
  },

  email: (v) => {
    const s = (trim(v) || '').toLowerCase();
    if (!s) return 'Enter an email address';
    // Deliberately permissive: the only way to truly validate an address is
    // to send to it, and over-strict patterns reject real addresses.
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(s)) return 'Enter a complete email address, like you@example.com';
    if (s.length > 120) return 'That email address is too long';
    return '';
  },

  // Indian mobile numbers: ten digits starting 6-9, optionally with a 0 or
  // +91 in front. The seed data and the real register both use this shape.
  phone: (v) => {
    const s = (trim(v) || '').replace(/[\s-()]/g, '');
    if (!s) return 'Enter a mobile number';
    const digits = s.replace(/^\+?91/, '').replace(/^0/, '');
    if (!/^\d+$/.test(digits)) return 'Use digits only';
    if (digits.length !== 10) return 'Enter a 10-digit mobile number';
    if (!/^[6-9]/.test(digits)) return 'An Indian mobile number starts with 6, 7, 8 or 9';
    return '';
  },

  // Landlines and switchboards are allowed here; centres list those.
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

  matches: (other, label = 'passwords') => (v, all) =>
    (v !== all[other] ? `The two ${label} do not match` : ''),

  bloodGroup: (v) => {
    if (!v) return 'Choose a blood group';
    return BLOOD_GROUPS.includes(v) ? '' : 'Choose a valid blood group';
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

  date: ({ label = 'Date', future = false, past = false, optional = false } = {}) => (v) => {
    if (!v) return optional ? '' : `${label} is required`;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return `${label} is not a real date`;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (future && d < today) return `${label} cannot be in the past`;
    if (past && d > new Date()) return `${label} cannot be in the future`;
    return '';
  },

  url: ({ optional = true } = {}) => (v) => {
    const s = trim(v) || '';
    if (!s) return optional ? '' : 'Enter a link';
    try { const u = new URL(s); return /^https?:$/.test(u.protocol) ? '' : 'Links must start with http:// or https://'; }
    catch { return 'That is not a complete link'; }
  },

  // Apply several rules to one field, first failure wins.
  all: (...fns) => (v, all) => {
    for (const fn of fns) { const m = fn(v, all); if (m) return m; }
    return '';
  },

  optional: (fn) => (v, all) => (trim(v) === '' || v == null ? '' : fn(v, all)),
};

// Runs a whole schema: { field: ruleFn }. Returns { field: message } for the
// fields that failed only.
export function validateAll(values, schema) {
  const errors = {};
  Object.entries(schema || {}).forEach(([field, rule]) => {
    const msg = typeof rule === 'function' ? rule(values[field], values) : '';
    if (msg) errors[field] = msg;
  });
  return errors;
}
