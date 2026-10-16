// Shared blood facts, so the compatibility checker, the donor search and the
// dashboard all answer the same question the same way.

export const GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

// Single source of truth: who each group can donate TO.
export const CAN_DONATE_TO = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],                                           // universal recipient
};

// Split "AB+" into the ABO family and the Rh sign. The family drives the
// colour used for every blood-group chip on the site; the sign is rendered
// quieter so the letter leads.
export function groupParts(group) {
  const m = String(group || '').trim().toUpperCase().match(/^(AB|A|B|O)\s*([+-])?$/);
  return m ? { family: m[1], sign: m[2] || '' } : { family: String(group || ''), sign: '' };
}

export const canReceiveFrom = (group) =>
  GROUPS.filter((donor) => CAN_DONATE_TO[donor].includes(group));

// The standard minimum interval between whole blood donations is 90 days.
// Returns null when the member has never donated — there is nothing to wait for.
export const DONATION_INTERVAL_DAYS = 90;

export function nextEligibleDate(lastDonation) {
  if (!lastDonation) return null;
  const d = new Date(lastDonation);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + DONATION_INTERVAL_DAYS);
  return d;
}

export function daysUntil(date) {
  if (!date) return 0;
  const ms = date.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(ms / 86400000);
}
