// Coordinates for every town in the hospital directory, and the mapping from
// "what is wrong with me" to the specialism that treats it.
//
// WHY COORDINATES LIVE HERE rather than on each hospital record: the
// directory is a list of addresses, not survey points. Placing a centre at
// its town's coordinates is honest about the precision on offer — a distance
// of "about 18 km" is useful, "18.43 km" would be invented.

const TOWNS = {
  ahmedabad: [23.03, 72.58],   amreli: [21.60, 71.22],      anand: [22.56, 72.96],
  bardoli: [21.12, 73.11],     bharuch: [21.71, 72.99],     bhavnagar: [21.76, 72.15],
  bhuj: [23.25, 69.67],        bilimora: [20.77, 72.96],    botad: [22.17, 71.67],
  dahod: [22.83, 74.26],       gandhidham: [23.08, 70.13],  gandhinagar: [23.22, 72.65],
  godhra: [22.78, 73.61],      himmatnagar: [23.60, 72.96], jamnagar: [22.47, 70.07],
  junagadh: [21.52, 70.46],    kamrej: [21.27, 72.96],      mehsana: [23.60, 72.40],
  morbi: [22.82, 70.84],       nadiad: [22.69, 72.86],      navsari: [20.95, 72.93],
  palanpur: [24.17, 72.43],    patan: [23.85, 72.13],       porbandar: [21.64, 69.61],
  rajkot: [22.30, 70.80],      surat: [21.17, 72.83],       surendranagar: [22.73, 71.65],
  vadodara: [22.31, 73.18],    valsad: [20.61, 72.93],      vapi: [20.37, 72.91],
  veraval: [20.91, 70.37],
};

// Plain-English complaints mapped onto the specialisms in the doctor list.
// The wording is what somebody would actually type, not clinical language.
const CONDITIONS = [
  { id: 'heart',     label: 'Heart, chest pain, blood pressure', specialisms: ['Cardiologist'] },
  { id: 'general',   label: 'Fever, infection, general illness',  specialisms: ['General Physician'] },
  { id: 'bones',     label: 'Bones, joints, fractures, back pain', specialisms: ['Orthopedic'] },
  { id: 'skin',      label: 'Skin, rash, hair',                   specialisms: ['Dermatologist'] },
  { id: 'child',     label: 'Children and babies',                specialisms: ['Pediatrician'] },
  { id: 'ent',       label: 'Ear, nose, throat',                  specialisms: ['ENT Specialist'] },
  { id: 'womens',    label: "Women's health and pregnancy",       specialisms: ['Gynecologist'] },
  { id: 'neuro',     label: 'Headaches, nerves, seizures',        specialisms: ['Neurologist'] },
];

const norm = (s) => String(s || '').trim().toLowerCase();

const coordsFor = (place) => TOWNS[norm(place)] || null;

// Great-circle distance in km. Over one state this is more than accurate
// enough, and it needs no external service.
const distanceKm = ([lat1, lon1], [lat2, lon2]) => {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Somebody typing "Adajan, Surat" or "near Nanpura" should still be matched to
// Surat. Scan the whole string for any town we know.
const resolvePlace = (text) => {
  const t = norm(text);
  if (!t) return null;
  if (TOWNS[t]) return { place: t, coords: TOWNS[t] };
  const hit = Object.keys(TOWNS)
    .filter((town) => t.includes(town))
    .sort((a, b) => b.length - a.length)[0];   // longest match wins
  return hit ? { place: hit, coords: TOWNS[hit] } : null;
};

const titleCase = (s) => String(s || '').replace(/\b\w/g, (c) => c.toUpperCase());

module.exports = { TOWNS, CONDITIONS, coordsFor, distanceKm, resolvePlace, titleCase, norm };
