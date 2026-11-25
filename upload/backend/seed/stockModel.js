// Blood stock generator for the sample directory.
//
// WHY THIS FILE EXISTS
// hospitalData.js is a plain directory: name, address, phone, type. It carries
// no stock figures, so every centre reported 0 units and the whole
// availability portal - the main public feature - read "Out of stock" on all
// 110 rows. This builds a believable stock ledger for each centre instead.
//
// The numbers are DETERMINISTIC: the same centre always gets the same stock,
// derived from a hash of its name. That matters because a re-seed should not
// silently change what a client saw in a demo yesterday.

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Share of a typical Indian blood bank's shelf, by group. Roughly follows the
// national distribution (B+ and O+ dominate; the negatives are scarce), which
// is what makes the stock chart look like a real one rather than eight
// identical bars.
const SHARE = {
  'A+': 0.210,
  'A-': 0.013,
  'B+': 0.330,
  'B-': 0.020,
  'AB+': 0.072,
  'AB-': 0.006,
  'O+': 0.332,
  'O-': 0.017,
};

// Stable 32-bit hash so stock does not move between re-seeds.
const hash = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

// A deterministic 0..1 stream keyed off the centre name plus a salt, so each
// field (capacity, per-group jitter) varies independently but repeatably.
const rand01 = (name, salt) => (hash(`${name}::${salt}`) % 10000) / 10000;

// Total units a centre is holding.
// Blood banks are the ones that actually store blood, so they carry the bulk;
// hospitals keep a working fridge. A small share of centres hold nothing,
// which is true of real portals and keeps the "Out of stock" state honest.
const capacityFor = (centre) => {
  const r = rand01(centre.name, 'cap');
  const isBank = centre.type === 'blood_bank';

  // ~5% of banks and ~12% of hospitals are not holding stock today.
  if (r < (isBank ? 0.05 : 0.12)) return 0;

  return isBank
    ? Math.round(45 + r * 165)   // 45 - 210 units
    : Math.round(8 + r * 46);    // 8 - 54 units
};

// How a centre's shelf divides between components.
//
// A bag of whole blood is separated within hours of donation, so a real
// fridge holds mostly red cells, then plasma, then a little of everything
// else. Platelets last five days, which is exactly why every blood bank is
// permanently short of them - the share here reflects that rather than
// splitting the total evenly, because an even split would make the platelet
// shortage the site keeps talking about disappear from its own data.
const COMPONENT_SHARE = {
  whole: 0.18,      // kept unseparated for major trauma
  prbc: 0.46,
  plasma: 0.27,
  platelets: 0.09,
};

// Split a centre's total across the eight groups, then each group across the
// four components.
const stockFor = (centre) => {
  const total = capacityFor(centre);
  if (total === 0) return [];

  const rows = [];
  GROUPS.forEach((group) => {
    // +/-45% jitter on the national share, so no two centres look alike.
    const jitter = 0.55 + rand01(centre.name, group) * 0.9;
    const groupTotal = total * SHARE[group] * jitter;
    if (groupTotal < 0.5) return;

    Object.entries(COMPONENT_SHARE).forEach(([component, share]) => {
      // A second, independent jitter per component: a centre can be well
      // stocked with red cells and have no platelets at all, which is the
      // normal state of affairs and the reason the component filter is worth
      // having.
      const cJitter = 0.45 + rand01(centre.name, `${group}:${component}`) * 1.15;
      const units = Math.round(groupTotal * share * cJitter);
      if (units > 0) rows.push({ bloodGroup: group, component, units });
    });
  });

  // Negative groups genuinely run dry, and so do individual components.
  // Leaving those gaps in is what makes the search worth running.
  return rows;
};

module.exports = { GROUPS, SHARE, COMPONENT_SHARE, stockFor, capacityFor, hash, rand01 };
