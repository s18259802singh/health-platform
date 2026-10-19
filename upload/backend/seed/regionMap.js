// City -> district lookup for the Gujarat directory.
//
// WHY THIS FILE EXISTS
// The hospital directory stores a single free-text address. The availability
// search needs a real district to group by, and deriving it by taking the last
// comma-separated token produced junk: addresses ending "..., Mehsana, Gujarat"
// gave a district called "Gujarat", and towns were filed as districts of
// themselves (Vapi, Nadiad, Godhra, Veraval and so on are towns, not
// districts). That made the district dropdown unusable.
//
// So the district now comes from a lookup, not from string position.
// Keys are lower-cased city/town names; values are the real revenue district.

const CITY_TO_DISTRICT = {
  ahmedabad: 'Ahmedabad',
  amreli: 'Amreli',
  anand: 'Anand',
  bardoli: 'Surat',
  bharuch: 'Bharuch',
  bhavnagar: 'Bhavnagar',
  bhuj: 'Kachchh',
  bilimora: 'Navsari',
  botad: 'Botad',
  dahod: 'Dahod',
  gandhidham: 'Kachchh',
  gandhinagar: 'Gandhinagar',
  godhra: 'Panchmahal',
  himmatnagar: 'Sabarkantha',
  jamnagar: 'Jamnagar',
  junagadh: 'Junagadh',
  kamrej: 'Surat',
  mehsana: 'Mehsana',
  morbi: 'Morbi',
  nadiad: 'Kheda',
  navsari: 'Navsari',
  palanpur: 'Banaskantha',
  patan: 'Patan',
  porbandar: 'Porbandar',
  rajkot: 'Rajkot',
  surat: 'Surat',
  surendranagar: 'Surendranagar',
  vadodara: 'Vadodara',
  valsad: 'Valsad',
  vapi: 'Valsad',
  veraval: 'Gir Somnath',

  // Cities outside Gujarat, matching seed/hospitalDataIndia.js.
  mumbai: 'Mumbai Suburban',
  pune: 'Pune',
  nagpur: 'Nagpur',
  nashik: 'Nashik',
  aurangabad: 'Chhatrapati Sambhajinagar',
  kolhapur: 'Kolhapur',
  jaipur: 'Jaipur',
  jodhpur: 'Jodhpur',
  udaipur: 'Udaipur',
  kota: 'Kota',
  ajmer: 'Ajmer',
  indore: 'Indore',
  bhopal: 'Bhopal',
  jabalpur: 'Jabalpur',
  gwalior: 'Gwalior',
  'new delhi': 'New Delhi',
  dwarka: 'South West Delhi',
  rohini: 'North West Delhi',
  bengaluru: 'Bengaluru Urban',
  mysuru: 'Mysuru',
  hubballi: 'Dharwad',
  mangaluru: 'Dakshina Kannada',
  chennai: 'Chennai',
  coimbatore: 'Coimbatore',
  madurai: 'Madurai',
  tiruchirappalli: 'Tiruchirappalli',
  hyderabad: 'Hyderabad',
  warangal: 'Hanumakonda',
  karimnagar: 'Karimnagar',
  kolkata: 'Kolkata',
  howrah: 'Howrah',
  siliguri: 'Darjeeling',
  durgapur: 'Paschim Bardhaman',
  lucknow: 'Lucknow',
  kanpur: 'Kanpur Nagar',
  varanasi: 'Varanasi',
  agra: 'Agra',
  noida: 'Gautam Buddha Nagar',
  ludhiana: 'Ludhiana',
  amritsar: 'Amritsar',
  jalandhar: 'Jalandhar',
  kochi: 'Ernakulam',
  thiruvananthapuram: 'Thiruvananthapuram',
  kozhikode: 'Kozhikode',
};

// Tokens that turn up at the end of an address but are never a place we can
// file a centre under - street names, the state itself, bare pincodes.
const NOT_A_PLACE = /^(gujarat|india|mg road|main road|station road|highway road|main bazar|gandhi chowk|old city|ring road|college road|\d{6}|)$/i;

const tidy = (s) =>
  String(s || '')
    .replace(/\s*-\s*\d{6}\b/g, '')   // drop "- 396445"
    .replace(/\s+District$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

// Pull {city, district} out of a free-text address.
// Scans every comma-separated token against the lookup rather than trusting
// the last one, so "..., Bilimora, Navsari" and "Highway Road, Mehsana,
// Gujarat" both land correctly.
const resolveRegion = (address) => {
  const parts = String(address || '').split(',').map(tidy).filter(Boolean);

  // Collect every token the lookup recognises, in the order they appear.
  // "Bilimora, Navsari" matches twice: the town comes first, the district
  // last, so take the city from the first match and the district from the
  // last. A single match (".., Athwalines, Surat") supplies both.
  const hits = parts.filter((p) => CITY_TO_DISTRICT[p.toLowerCase()]);
  if (hits.length) {
    return {
      city: hits[0],
      district: CITY_TO_DISTRICT[hits[hits.length - 1].toLowerCase()],
    };
  }

  // Nothing matched the lookup - fall back to the last token that is at least
  // a plausible place name, and file it under itself.
  const fallback = [...parts].reverse().find((p) => !NOT_A_PLACE.test(p));
  return { city: fallback || 'Other', district: fallback || 'Other' };
};

// Addresses in the source directory often repeat the town and district at the
// end, e.g. "Shroff Complex, Bilimora, Navsari - 396445, Bilimora, Navsari".
// Collapse repeated trailing tokens so the table reads cleanly.
const tidyAddress = (address) => {
  const parts = String(address || '').split(',').map((p) => p.trim()).filter(Boolean);
  const kept = [];
  const seen = new Set();
  parts.forEach((part) => {
    const key = tidy(part).toLowerCase();
    // Keep the first occurrence of each place token; always keep the street
    // detail at the front even if it looks repetitive.
    if (key && seen.has(key)) return;
    seen.add(key);
    kept.push(part);
  });
  return kept.join(', ');
};

module.exports = { CITY_TO_DISTRICT, resolveRegion, tidyAddress };
