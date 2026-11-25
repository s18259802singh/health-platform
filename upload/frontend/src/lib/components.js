// BLOOD COMPONENTS — the browser's copy.
//
// Keys, order and labels must match backend/utils/components.js. That file
// carries the long explanation of why components exist at all; this one is
// the same list plus the few helpers the pages need.
//
// Before this existed, the Availability page had a "Whole Blood / Packed Red
// Cells / Plasma / Platelets" dropdown that was thrown away before the
// request was sent — it looked like a filter and did nothing. The dropdown is
// the same; it now means something.

export const COMPONENTS = [
  {
    key: 'whole',
    label: 'Whole Blood',
    short: 'Whole',
    shelf: '35 days',
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

export const COMPONENT_KEYS = COMPONENTS.map((c) => c.key);

// Rows written before components existed carry none; they are whole blood.
export const normaliseComponent = (value) => {
  const v = String(value || '').trim().toLowerCase();
  if (!v) return 'whole';
  if (COMPONENT_KEYS.includes(v)) return v;
  const byLabel = COMPONENTS.find(
    (c) => c.label.toLowerCase() === v || c.short.toLowerCase() === v,
  );
  return byLabel ? byLabel.key : 'whole';
};

export const componentOf = (key) =>
  COMPONENTS.find((c) => c.key === normaliseComponent(key)) || COMPONENTS[0];

export const labelFor = (key) => componentOf(key).label;

// Units held, optionally narrowed to one group and/or one component.
export const unitsOf = (rows = [], { bloodGroup = '', component = '' } = {}) => {
  const comp = component ? normaliseComponent(component) : '';
  return (rows || []).reduce((total, r) => {
    if (bloodGroup && r.bloodGroup !== bloodGroup) return total;
    if (comp && normaliseComponent(r.component) !== comp) return total;
    return total + (Number(r.units) || 0);
  }, 0);
};

// {group: {component: units}} — what the centre page's matrix is drawn from.
export const stockTable = (rows = []) => {
  const table = {};
  (rows || []).forEach((r) => {
    if (!r?.bloodGroup) return;
    const comp = normaliseComponent(r.component);
    table[r.bloodGroup] = table[r.bloodGroup] || {};
    table[r.bloodGroup][comp] = (table[r.bloodGroup][comp] || 0) + (Number(r.units) || 0);
  });
  return table;
};

// Totals per component, in list order — the figures behind the tabs.
export const byComponent = (rows = []) =>
  COMPONENTS.map((c) => ({ ...c, units: unitsOf(rows, { component: c.key }) }));

// The options a dropdown wants. An empty first entry means "any component",
// which is the honest default for someone who does not know what they need.
export const componentOptions = (anyLabel = 'All components') => [
  { value: '', label: anyLabel },
  ...COMPONENTS.map((c) => ({ value: c.key, label: c.label })),
];
