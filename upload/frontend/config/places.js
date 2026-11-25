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

  // The rest of the country. Same source of truth as seed/hospitalDataIndia.js;
  // if you add a city there, add its coordinates here or "near me" cannot
  // place it.
  mumbai: [19.08, 72.88],
  pune: [18.52, 73.86],
  nagpur: [21.15, 79.09],
  nashik: [20.00, 73.79],
  aurangabad: [19.88, 75.34],
  kolhapur: [16.70, 74.24],
  jaipur: [26.91, 75.79],
  jodhpur: [26.24, 73.02],
  udaipur: [24.58, 73.69],
  kota: [25.21, 75.86],
  ajmer: [26.45, 74.64],
  indore: [22.72, 75.86],
  bhopal: [23.26, 77.41],
  jabalpur: [23.18, 79.95],
  gwalior: [26.22, 78.18],
  'new delhi': [28.61, 77.21],
  dwarka: [28.59, 77.05],
  rohini: [28.74, 77.12],
  bengaluru: [12.97, 77.59],
  mysuru: [12.30, 76.64],
  hubballi: [15.36, 75.12],
  mangaluru: [12.91, 74.86],
  chennai: [13.08, 80.27],
  coimbatore: [11.02, 76.96],
  madurai: [9.93, 78.12],
  tiruchirappalli: [10.79, 78.70],
  hyderabad: [17.39, 78.49],
  warangal: [17.98, 79.59],
  karimnagar: [18.44, 79.13],
  kolkata: [22.57, 88.36],
  howrah: [22.59, 88.31],
  siliguri: [26.73, 88.40],
  durgapur: [23.53, 87.31],
  lucknow: [26.85, 80.95],
  kanpur: [26.45, 80.33],
  varanasi: [25.32, 82.97],
  agra: [27.18, 78.01],
  noida: [28.54, 77.39],
  ludhiana: [30.90, 75.86],
  amritsar: [31.63, 74.87],
  jalandhar: [31.33, 75.58],
  kochi: [9.93, 76.27],
  thiruvananthapuram: [8.52, 76.94],
  kozhikode: [11.25, 75.78],
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
