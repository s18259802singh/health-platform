// BLOOD COMPONENTS
//
// Almost no patient receives whole blood. Within hours of a donation the bag
// is spun in a centrifuge and split into red cells, plasma and platelets,
// because the three go to completely different wards and keep for completely
// different lengths of time. A portal that reports one number per blood group
// cannot answer the question people actually arrive with — a haematology ward
// ringing round for platelets does not care how many units of whole blood a
// centre is holding.
//
// This is the single list both halves of the application work from. The
// frontend has a copy at frontend/src/lib/components.js; the keys and the
// order must match it, and anything added here has to be added there.

const COMPONENTS = [
  {
    key: 'whole',
    label: 'Whole Blood',
    short: 'Whole',
    shelf: '35 days',
    // Who it is actually for. eRaktKosh lists the component names and leaves
    // it there; the name alone is no use to somebody who has been told to
    // "find platelets" and does not know what that means.
    use: 'Rarely transfused as-is — most of it is separated within hours of donation.',
  },
  {
    key: 'prbc',
    label: 'Packed Red Cells',
    short: 'Red cells',
    shelf: '42 days',
    use: 'Accident victims, surgery, and severe anaemia. The component most hospitals draw on.',
  },
  {
    key: 'plasma',
    label: 'Plasma',
    short: 'Plasma',
    shelf: '1 year frozen',
    use: 'Burns, liver disease and clotting disorders. Frozen, so it is the one component that keeps.',
  },
  {
    key: 'platelets',
    label: 'Platelets',
    short: 'Platelets',
    shelf: '5 days',
    use: 'Chemotherapy patients and dengue with a falling count. Five days on the shelf, so stock is always thin.',
  },
];

const COMPONENT_KEYS = COMPONENTS.map((c) => c.key);

// Stock rows written before components existed carry no component at all.
// They are whole blood, which is what the field meant at the time.
const normaliseComponent = (value) => {
  const v = String(value || '').trim().toLowerCase();
  if (!v) return 'whole';
  if (COMPONENT_KEYS.includes(v)) return v;
  // Tolerate the display labels, since an import or an admin edit may send
  // "Packed Red Cells" rather than "prbc".
  const byLabel = COMPONENTS.find(
    (c) => c.label.toLowerCase() === v || c.short.toLowerCase() === v,
  );
  return byLabel ? byLabel.key : 'whole';
};

const labelFor = (key) =>
  (COMPONENTS.find((c) => c.key === normaliseComponent(key)) || COMPONENTS[0]).label;

// One stock array in, a {group: {component: units}} table out. Every caller
// that needs to answer "how much of X does this centre hold" goes through
// this, so legacy rows are folded into 'whole' in exactly one place.
const stockTable = (rows = []) => {
  const table = {};
  rows.forEach((r) => {
    const group = r.bloodGroup;
    if (!group) return;
    const comp = normaliseComponent(r.component);
    const n = Number(r.units) || 0;
    table[group] = table[group] || {};
    table[group][comp] = (table[group][comp] || 0) + n;
  });
  return table;
};

// Units held, optionally narrowed to one group and/or one component.
const unitsOf = (rows = [], { bloodGroup = '', component = '' } = {}) => {
  const comp = component ? normaliseComponent(component) : '';
  return rows.reduce((total, r) => {
    if (bloodGroup && r.bloodGroup !== bloodGroup) return total;
    if (comp && normaliseComponent(r.component) !== comp) return total;
    return total + (Number(r.units) || 0);
  }, 0);
};

// Totals per component across a centre, in list order, for the tabs.
const byComponent = (rows = []) =>
  COMPONENTS.map((c) => ({ ...c, units: unitsOf(rows, { component: c.key }) }));

module.exports = {
  COMPONENTS,
  COMPONENT_KEYS,
  normaliseComponent,
  labelFor,
  stockTable,
  unitsOf,
  byComponent,
};
