// DEMO MODE
// Builds a self-contained copy of the app that runs with no backend, so the
// design can be shown to a client from a single hosted page. It is switched
// on only by VITE_DEMO=true at build time; the normal production build never
// imports any of this data.

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CITIES = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Navsari', 'Valsad', 'Junagadh'];

// The wider register the dashboard map draws from. Weights are rough
// population shares, so Ahmedabad and Surat carry the most donors and the
// map does not come out as 25 identical dots.
const REGISTER = [
  ['Ahmedabad', 26], ['Surat', 22], ['Vadodara', 14], ['Rajkot', 12], ['Bhavnagar', 8],
  ['Jamnagar', 7], ['Junagadh', 6], ['Gandhinagar', 6], ['Navsari', 5], ['Anand', 5],
  ['Bharuch', 5], ['Nadiad', 4], ['Mehsana', 4], ['Valsad', 4], ['Morbi', 3],
  ['Surendranagar', 3], ['Vapi', 3], ['Bhuj', 3], ['Amreli', 2], ['Porbandar', 2],
  ['Godhra', 2], ['Patan', 2], ['Palanpur', 2], ['Veraval', 2], ['Gandhidham', 2],
];
const NAMES = ['Priya Shah', 'Rahul Mehta', 'Anita Desai', 'Vikram Joshi', 'Neha Patel', 'Arjun Rao',
  'Kavita Nair', 'Sanjay Verma', 'Meera Iyer', 'Rohit Shah', 'Divya Menon', 'Amit Trivedi',
  'Farah Khan', 'Nikhil Bose', 'Sneha Gupta', 'Imran Qureshi', 'Pooja Rana', 'Karan Dave'];

const iso = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const CENTRE_NAMES = ['Civil Hospital', 'Red Cross Blood Bank', 'Sterling Hospital', 'Raktadan Kendra',
  'Apollo Blood Centre', 'Lions Blood Centre', 'Shalby Hospital', 'Wockhardt Blood Bank',
  'Sunshine Global Hospital', 'Prathama Blood Centre'];

const hospitals = Array.from({ length: 38 }, (_, i) => {
  const city = CITIES[i % CITIES.length];
  return {
    _id: `h${i}`,
    name: `${CENTRE_NAMES[i % CENTRE_NAMES.length]}, ${city}`,
    address: `${['Ring Road', 'Station Road', 'Civil Lines', 'College Road', 'Main Bazaar'][i % 5]}, ${city} - 3${90000 + i * 37}`,
    contactNumber: i % 5 === 0 ? 'N/A' : `0${261 + (i % 20)} 2${400000 + i * 131}`,
    type: i % 3 === 0 ? 'blood_bank' : 'hospital',
    city, district: city, state: 'Gujarat',
    // Weighted by how common each group actually is, so the supply chart
    // shows real scarcity (O negative and AB negative are the thin ones)
    // rather than eight identical bars.
    availableBloodUnits: GROUPS
      .map((g, j) => {
        const weight = [1.00, 0.22, 0.85, 0.18, 0.30, 0.08, 1.35, 0.26][j];
        const base = ((i * 7 + j * 13) % 17) + 4;
        return { bloodGroup: g, units: Math.round(base * weight) };
      })
      .filter((u) => u.units > 0),
  };
});

const camps = [
  { _id: 'c1', title: 'City Centre Mega Blood Drive', organiser: 'Indian Red Cross Society, Surat', venue: 'SMC Hall, Muglisara', city: 'Surat', state: 'Gujarat', date: iso(3), startTime: '09:00 AM', endTime: '04:00 PM', slots: 180, status: 'upcoming', contactNumber: '0261 242 3333', description: 'Our largest drive of the quarter, run with four partner blood centres. Walk-ins are welcome, but registering ahead guarantees a slot and cuts waiting to about fifteen minutes.\n\nRefreshments, a medical check and a donation certificate are provided on the day.', registered: 118 },
  { _id: 'c2', title: 'Campus Donors Day', organiser: 'VNSGU National Service Scheme', venue: 'Main Auditorium, VNSGU Campus', city: 'Surat', state: 'Gujarat', date: iso(6), startTime: '10:00 AM', endTime: '03:00 PM', slots: 120, status: 'upcoming', contactNumber: '0261 227 7956', description: 'A student-led camp, open to staff and the public as well. First-time donors are paired with a volunteer who walks them through the process.', registered: 71 },
  { _id: 'c3', title: 'Corporate Donation Camp', organiser: 'Prathama Blood Centre', venue: 'GIFT City Club House', city: 'Ahmedabad', state: 'Gujarat', date: iso(9), startTime: '09:30 AM', endTime: '05:00 PM', slots: 200, status: 'upcoming', contactNumber: '079 2970 0101', description: 'Hosted across three office towers with a shuttle running between them. Book a thirty-minute window so your team can attend together.', registered: 96 },
  { _id: 'c4', title: 'Community Blood Drive', organiser: 'Lions Club of Rajkot', venue: 'Race Course Ground Pavilion', city: 'Rajkot', state: 'Gujarat', date: iso(12), startTime: '08:00 AM', endTime: '02:00 PM', slots: 150, status: 'upcoming', contactNumber: '0281 248 1111', description: 'An annual drive that has collected more than 4,000 units since it began. Parking is free at the pavilion gate.', registered: 142 },
  { _id: 'c5', title: 'Festival of Giving', organiser: 'Baroda Blood Bank Association', venue: 'Sayajigunj Community Centre', city: 'Vadodara', state: 'Gujarat', date: iso(15), startTime: '10:00 AM', endTime: '06:00 PM', slots: 160, status: 'upcoming', contactNumber: '0265 236 5000', description: 'Part of the city festival week, with six donation bays running in parallel.', registered: 64 },
  { _id: 'c6', title: 'Thalassaemia Support Drive', organiser: 'Gujarat Thalassaemia Society', venue: 'Civil Hospital Annexe, Asarwa', city: 'Ahmedabad', state: 'Gujarat', date: iso(19), startTime: '09:00 AM', endTime: '01:00 PM', slots: 90, status: 'upcoming', contactNumber: '079 2268 0074', description: 'Units from this camp are reserved for children on regular transfusion programmes. B negative and O negative are especially needed.', registered: 38 },
  { _id: 'c7', title: 'Coastal Camp', organiser: 'Rotary Club of Bhavnagar', venue: 'Rotary Bhavan, Waghawadi Road', city: 'Bhavnagar', state: 'Gujarat', date: iso(23), startTime: '09:00 AM', endTime: '03:00 PM', slots: 110, status: 'upcoming', contactNumber: '0278 242 8800', description: 'A smaller, calmer camp, well suited to first-time donors who would rather avoid a crowd.', registered: 51 },
  { _id: 'c8', title: 'District Drive', organiser: 'B.K. Shah Red Cross Bhavan', venue: 'Red Cross Bhavan, Station Road', city: 'Navsari', state: 'Gujarat', date: iso(28), startTime: '09:30 AM', endTime: '02:30 PM', slots: 100, status: 'upcoming', contactNumber: '02637 259 300', description: 'Covering Navsari and the surrounding talukas, with a mobile unit visiting Bilimora in the afternoon.', registered: 44 },
  { _id: 'c9', title: 'Monsoon Emergency Appeal', organiser: 'Indian Red Cross Society', venue: 'Athwalines Community Hall', city: 'Surat', state: 'Gujarat', date: iso(-8), startTime: '09:00 AM', endTime: '05:00 PM', slots: 140, status: 'completed', description: 'Called at short notice after flooding disrupted supply across the district. 131 units collected in a single day.', registered: 131 },
  { _id: 'c10', title: 'Independence Week Drive', organiser: 'Lions Club of Rajkot', venue: 'Rajkot Town Hall', city: 'Rajkot', state: 'Gujarat', date: iso(-21), startTime: '08:30 AM', endTime: '03:00 PM', slots: 120, status: 'completed', description: 'Run alongside the civic celebrations, with 98 donors giving over two days.', registered: 98 },
].map((c) => ({
  ...c,
  registrations: Array.from({ length: c.registered }, (_, i) => ({
    _id: `${c._id}r${i}`, name: NAMES[i % NAMES.length],
    phone: `09${400000000 + i}`, bloodGroup: GROUPS[i % 8],
    registeredAt: new Date(Date.now() - i * 36e5),
  })),
}));

const stories = [
  { _id: 's1', name: 'Meera Joshi', role: 'recipient', bloodGroup: 'B-', city: 'Surat', featured: true, headline: 'Four units in one night, from four strangers', body: 'I went into surgery expecting a routine afternoon and came out needing more blood than the hospital had on the shelf for my group.\n\nB negative is not common. By the time my brother thought to search for donors it was past nine at night. He found four people within eleven kilometres, called three of them, and all three came.\n\nI have never met two of them. I think about that more than I expected to.' },
  { _id: 's2', name: 'Arjun Rao', role: 'donor', bloodGroup: 'O-', city: 'Ahmedabad', featured: true, headline: 'I am the universal donor, so I treat it as a standing appointment', body: 'O negative goes to anyone, which means it is the bag they reach for when there is no time to type a patient.\n\nI set a reminder every three months. Fifteen minutes, a biscuit, back to work. In eight years that has added up to twenty-six donations and I have never once felt worse for it.\n\nThe only thing I would change is how long it took me to start.' },
  { _id: 's3', name: 'Fatima Shaikh', role: 'donor', bloodGroup: 'A+', city: 'Vadodara', featured: true, headline: 'I was terrified of needles until I actually did it', body: 'I had put it off for years. Genuinely frightened — I would look away during a blood test.\n\nA colleague offered to come with me to a camp. The nurse talked me through every step before she did it, and the part I had been dreading lasted about eight seconds.\n\nI have donated five times since. I still look away. It still only takes eight seconds.' },
  { _id: 's4', name: 'Rohit Shah', role: 'donor', bloodGroup: 'B+', city: 'Rajkot', headline: 'A request came through at 2am and I was eleven minutes away', body: 'My phone buzzed with a request for B positive at a hospital I drive past every day.\n\nI almost did not open it. I am glad I did. The patient was a nineteen-year-old after a road accident, and by the time I arrived two other donors were already in the corridor.\n\nNone of us knew each other. We waited together until someone came out and said it had gone well.' },
  { _id: 's5', name: 'Priya Desai', role: 'recipient', bloodGroup: 'AB+', city: 'Navsari', headline: 'My daughter needed platelets every fortnight for a year', body: 'Dengue took her platelet count somewhere no parent wants to see on a chart. What followed was a year of fortnightly transfusions.\n\nWhat I did not understand before is that platelets expire in days. There is no stockpile. Every bag she received was given by someone in the week she needed it.\n\nShe is fifteen now and fine. She has already asked when she can donate.' },
  { _id: 's6', name: 'Sanjay Trivedi', role: 'organiser', bloodGroup: 'A-', city: 'Bhavnagar', headline: 'We run one camp a year and it carries the district through the summer', body: 'Our club has been organising the same drive for nineteen years. The first one collected thirty-one units.\n\nThis year it was two hundred and forty. The difference is not enthusiasm — it was always there — it is that people can now see where the shortage is and plan around it.\n\nShow someone a number and they turn up.' },
  { _id: 's7', name: 'Anita Nair', role: 'donor', bloodGroup: 'O+', city: 'Surat', headline: 'Fifty donations, and the hundredth is the one I am counting towards', body: 'I started at twenty-two because my father did. He stopped at sixty-five, which is the upper limit, and handed me the card he had been carrying.\n\nI crossed fifty this spring. At one every three months that puts a hundred somewhere in my sixties, which feels like a reasonable thing to aim at.\n\nMy son is nineteen. He has been twice.' },
  { _id: 's8', name: 'Vikram Patel', role: 'donor', bloodGroup: 'AB-', city: 'Ahmedabad', headline: 'My group is under one percent of people, so I stay on the register', body: 'AB negative is the rarest of the eight. Fewer than one person in a hundred has it.\n\nThat means I am not going to be called often, and when I am called it genuinely matters. I keep my number current and my phone loud.\n\nThree calls in six years. All three I went.' },
  { _id: 's9', name: 'Imran Qureshi', role: 'donor', bloodGroup: 'B+', city: 'Valsad', headline: 'My employer gives a half day for it, so there is no excuse left', body: 'The company added donation leave two years ago. Half a day, four times a year, no questions.\n\nTwenty-two of us went the first time. It has become the thing people arrange around rather than the thing they forget.' },
  { _id: 's10', name: 'Pooja Rana', role: 'recipient', bloodGroup: 'O+', city: 'Junagadh', headline: 'Post-partum haemorrhage, and the bank was forty minutes away', body: 'Nobody plans for it. One minute everything is normal and the next there are a lot of people in the room moving quickly.\n\nWhat saved the time was that somebody already knew which bank had O positive on the shelf. They did not have to ring round.' },
];

const GCAT = ['education', 'eligibility', 'preparation', 'recovery', 'regular'];
const GUIDE_SEED = {
  education: [
    ['What actually happens to your blood after you donate', 'From the needle to the patient: testing, separation into components, storage and shelf life.'],
    ['Blood groups and who can give to whom', 'The ABO and Rh system explained without the chart you have to squint at.'],
    ['Six myths that stop people donating', 'The common worries, and what is actually true.'],
  ],
  eligibility: [
    ['Can I donate blood? The basic criteria', 'Age, weight, haemoglobin and the gap between donations.'],
    ['Reasons you may be asked to wait', 'Temporary deferrals — and roughly how long each one lasts.'],
  ],
  preparation: [
    ['The 24 hours before you donate', 'Sleep, food, water and the two things to avoid.'],
    ['What the appointment is actually like', 'Step by step, from the front desk to the biscuit.'],
  ],
  recovery: [
    ['The rest of your day, after donating', 'What to do, what to avoid, and what is normal.'],
    ['Rebuilding your iron', 'What your body replaces, how fast, and what helps.'],
  ],
  regular: [
    ['Becoming a regular donor', 'Why a rhythm beats good intentions, and how to build one.'],
    ['Answering a request without putting yourself at risk', 'How to respond safely when someone needs your group urgently.'],
  ],
};

const GUIDE_BODY = 'Blood supply is a flow problem rather than a stock problem. Red cells keep for around six weeks under refrigeration and platelets for about five days, which is why donation has to be continuous rather than occasional.\n\nThe criteria used by Indian blood centres are these: aged 18 to 65, weighing at least 45 kg, haemoglobin of 12.5 g/dL or above, and more than 90 days since your last whole blood donation. You should also be generally well on the day.\n\nThese are the thresholds, not the whole decision. The doctor at the centre confirms eligibility on the day and can accept or defer you for reasons not on this list. If you are unsure, go and ask rather than assuming the answer is no.';

const guides = [];
GCAT.forEach((cat) => GUIDE_SEED[cat].forEach(([title, summary], i) => guides.push({
  _id: `${cat}${i}`, category: cat, order: i + 1, readMinutes: 3 + (i % 2),
  title, summary, body: GUIDE_BODY,
})));

const board = NAMES.map((n, i) => {
  const parts = n.split(' ');
  const donations = Math.max(1, 54 - i * 3);
  return {
    rank: i + 1,
    name: `${parts[0]} ${parts[1][0]}.`,
    city: CITIES[i % CITIES.length],
    bloodGroup: GROUPS[i % 8],
    donations,
    units: donations,
    lastDonation: new Date(Date.now() - i * 86400000 * 19),
    tier: donations >= 25 ? 'Platinum' : donations >= 15 ? 'Gold' : donations >= 8 ? 'Silver' : donations >= 3 ? 'Bronze' : 'Donor',
  };
});

const TIERS = [
  { min: 25, label: 'Platinum', note: '25+ donations' },
  { min: 15, label: 'Gold', note: '15+ donations' },
  { min: 8, label: 'Silver', note: '8+ donations' },
  { min: 3, label: 'Bronze', note: '3+ donations' },
  { min: 1, label: 'Donor', note: 'First donation made' },
];

const myDonations = Array.from({ length: 9 }, (_, i) => ({
  _id: `d${i}`,
  donatedAt: new Date(Date.now() - (i * 94 + 12) * 86400000),
  bloodGroup: 'O-', units: 1,
  locationName: hospitals[i % hospitals.length].name,
  certificateNo: `LL-2026-${(10000 + i * 37).toString(36).toUpperCase()}`,
  // The two most recent are still with the centre, so the preview shows both
  // an issued certificate and one awaiting issue.
  certificateIssued: i > 1,
  certificateIssuedAt: i > 1 ? new Date(Date.now() - (i * 94) * 86400000) : undefined,
}));

const donors = (() => {
  const out = [];
  let i = 0;
  REGISTER.forEach(([city, n]) => {
    for (let k = 0; k < n; k += 1, i += 1) {
      out.push({
        _id: `u${i}`,
        name: NAMES[i % NAMES.length],
        bloodGroup: GROUPS[(i * 3) % 8],
        phone: `09${100000000 + i * 7919}`,
        location: city,
      });
    }
  });
  return out;
})();

// Three doctors per centre, generated the same way everywhere they are asked
// for, so an id handed out by /care/near still resolves under /doctors.
const DOC_NAMES = ['Dr. Mehta','Dr. Patel','Dr. Shah','Dr. Desai','Dr. Trivedi','Dr. Joshi'];
const DOC_SPECS = ['Cardiologist','General Physician','Orthopedic','Dermatologist','Pediatrician','ENT Specialist','Gynecologist','Neurologist'];
const DOC_DAYS = [['Monday','Wednesday','Friday'],['Tuesday','Thursday'],['Monday','Saturday']];
const DOC_SLOTS = [['10:00 AM','11:00 AM','4:00 PM'],['9:00 AM','12:00 PM'],['11:00 AM','2:00 PM']];
const doctorsFor = (hospitalId, i = 0) => [0, 1, 2].map((k) => ({
  _id: `${hospitalId}-d${k}`,
  hospitalId,
  name: DOC_NAMES[(i + k) % DOC_NAMES.length],
  specialization: DOC_SPECS[(i * 3 + k) % DOC_SPECS.length],
  availableDays: DOC_DAYS[k % 3],
  availableTimeSlots: DOC_SLOTS[k % 3],
}));

const blogs = [
  { _id: 'b1', title: 'Why platelet donors are needed every single week', excerpt: 'Platelets last about five days, which changes everything about how supply works.', author: 'LifeLink Team', imageUrl: '', createdAt: new Date(Date.now() - 4 * 864e5).toISOString(), content: GUIDE_BODY },
  { _id: 'b2', title: 'What the haemoglobin finger-prick is actually checking', excerpt: 'The test that decides whether you donate today, explained in a minute.', author: 'Dr A. Mehta', imageUrl: '', createdAt: new Date(Date.now() - 13 * 864e5).toISOString(), content: GUIDE_BODY },
  { _id: 'b3', title: 'How a blood bank decides which unit goes where', excerpt: 'Crossmatching, shelf life and the logic behind the fridge.', author: 'LifeLink Team', imageUrl: '', createdAt: new Date(Date.now() - 26 * 864e5).toISOString(), content: GUIDE_BODY },
];

// The board shows the top 18; the totals describe the whole register behind
// it, which is what the counters on the landing page are reporting.
const totalsFor = () => {
  const donations = 1247;
  return { donations, units: 1389, donors: 163, livesTouched: 1389 * 3 };
};

// --- the little router -----------------------------------------------------
function resolve(url, config = {}) {
  const [path, qs] = String(url).split('?');
  const q = Object.fromEntries(new URLSearchParams(qs || ''));
  const p = { ...q, ...(config.params || {}) };
  const seg = path.split('/').filter(Boolean);   // e.g. ['camps','c1']

  const availability = () => {
    let list = hospitals;
    if (p.state) list = list.filter((h) => h.state === p.state);
    if (p.district) list = list.filter((h) => h.district === p.district);
    if (p.type) list = list.filter((h) => h.type === p.type);
    if (p.search) {
      const s = p.search.toLowerCase();
      list = list.filter((h) => h.name.toLowerCase().includes(s) || h.address.toLowerCase().includes(s) || h.city.toLowerCase().includes(s));
    }
    const results = list.map((h) => {
      const stock = h.availableBloodUnits || [];
      const match = p.bloodGroup ? stock.find((u) => u.bloodGroup === p.bloodGroup) : null;
      const units = p.bloodGroup ? (match?.units || 0) : stock.reduce((a, u) => a + u.units, 0);
      return {
        _id: h._id, name: h.name, address: h.address, city: h.city, district: h.district,
        state: h.state, contactNumber: h.contactNumber, type: h.type, units,
        availability: units > 10 ? 'good' : units > 3 ? 'limited' : units > 0 ? 'critical' : 'none',
        breakdown: stock,
      };
    });
    if (p.bloodGroup) results.sort((a, b) => b.units - a.units);
    return {
      query: p, count: results.length,
      withStock: results.filter((r) => r.units > 0).length,
      totalUnits: results.reduce((a, r) => a + r.units, 0),
      results, updatedAt: new Date().toISOString(),
    };
  };

  switch (seg[0]) {
    case 'availability':
      if (seg[1] === 'regions') {
        return { states: [{ state: 'Gujarat', districts: [...CITIES].sort() }], components: ['Whole Blood', 'Packed Red Cells', 'Plasma', 'Platelets'] };
      }
      return availability();

    case 'camps':
      if (seg[1] === 'mine') return [camps[0], camps[2]];
      if (seg[1]) return camps.find((c) => c._id === seg[1]) || camps[0];
      return p.upcoming === 'true' ? camps.filter((c) => c.status === 'upcoming') : camps;

    case 'stories':
      if (seg[1]) return stories.find((s) => s._id === seg[1]) || stories[0];
      return p.featured === 'true' ? stories.filter((s) => s.featured) : stories;

    case 'guides': {
      if (seg[1]) {
        const g = guides.find((x) => x._id === seg[1]) || guides[0];
        return { guide: g, next: guides[guides.indexOf(g) + 1] || null };
      }
      return { categories: GCAT.map((c) => ({ category: c, items: guides.filter((g) => g.category === c) })), total: guides.length };
    }

    case 'donations':
      if (seg[1] === 'leaderboard') {
        let e = board;
        if (p.city) e = e.filter((x) => x.city === p.city);
        if (p.bloodGroup) e = e.filter((x) => x.bloodGroup === p.bloodGroup);
        return { entries: e.slice(0, Number(p.limit) || 50).map((x, i) => ({ ...x, rank: i + 1 })), tiers: TIERS, totals: totalsFor() };
      }
      if (seg[1] === 'mine') {
        return {
          member: { name: 'Dhruv Shah', bloodGroup: 'O-', city: 'Ahmedabad' },
          donations: myDonations,
          summary: { count: 9, units: 9, livesTouched: 27, tier: 'Silver', tierNote: '8+ donations', nextTier: { label: 'Gold', needed: 6 }, firstDonation: myDonations[8].donatedAt, lastDonation: myDonations[0].donatedAt, certificatesIssued: 7, certificatesPending: 2 },
        };
      }
      if (seg[2] === 'certificate') {
        return { certificateNo: 'LL-2026-0A47X', name: 'Dhruv Shah', bloodGroup: 'O-', units: 1, donatedAt: myDonations[0].donatedAt, location: 'Prathama Blood Centre, Ahmedabad', city: 'Ahmedabad', donationNumber: 9, livesTouched: 3 };
      }
      return [];

    case 'hospitals': return hospitals;
    case 'donors': {
      // Mirror the real endpoint's filters, otherwise clicking a city on the
      // dashboard map appears to do nothing in the demo build.
      let list = donors;
      if (p.location) {
        const q = String(p.location).toLowerCase();
        list = list.filter((d) => d.location.toLowerCase().includes(q));
      }
      if (p.bloodGroup) list = list.filter((d) => d.bloodGroup === p.bloodGroup);
      return list;
    }
    case 'blogs': return seg[1] ? (blogs.find((b) => b._id === seg[1]) || blogs[0]) : blogs;
    case 'stats': return GROUPS.map((g, i) => ({ group: g, donors: [29, 8, 27, 14, 10, 12, 40, 13][i], pendingRequests: [1, 0, 0, 2, 1, 0, 0, 3][i] }));
    case 'donation-requests': {
      const all = Array.from({ length: 18 }, (_, i) => ({
        _id: `rq${i}`,
        bloodGroupNeeded: GROUPS[(i * 5) % 8],
        location: `${['New Civil Hospital', 'Sterling Hospital', 'Civil Hospital', 'Apollo Hospital', 'Red Cross Centre'][i % 5]}, ${REGISTER[i % REGISTER.length][0]}`,
        requesterId: {
          name: NAMES[i % NAMES.length],
          phone: `09${700000000 + i * 131}`,
          location: REGISTER[i % REGISTER.length][0],
        },
        status: i % 4 === 3 ? 'fulfilled' : 'pending',
        createdAt: new Date(Date.now() - (i * 7 + 2) * 36e5),
      }));
      const want = p.status;
      return want ? all.filter((r) => r.status === want) : all;
    }
    case 'care': {
      if (seg[1] === 'options') {
        return { cities: [...new Set(REGISTER.map(([c]) => c))].sort(),
          conditions: [
            {id:'heart',label:'Heart, chest pain, blood pressure'},
            {id:'general',label:'Fever, infection, general illness'},
            {id:'bones',label:'Bones, joints, fractures, back pain'},
            {id:'skin',label:'Skin, rash, hair'},
            {id:'child',label:'Children and babies'},
            {id:'ent',label:'Ear, nose, throat'},
            {id:'womens',label:"Women's health and pregnancy"},
            {id:'neuro',label:'Headaches, nerves, seizures'},
          ] };
      }
      // near: fake distances that still sort sensibly, so the page can be
      // judged without a backend.
      const want = String(p.place || '').toLowerCase();
      if (!want) return { message: 'Tell us roughly where you are.', unresolved: true };
      const SPEC = { heart:['Cardiologist'], general:['General Physician'], bones:['Orthopedic'],
        skin:['Dermatologist'], child:['Pediatrician'], ent:['ENT Specialist'],
        womens:['Gynecologist'], neuro:['Neurologist'] };
      const wanted = SPEC[p.condition];
      const SPEC_ALL = ['Cardiologist','General Physician','Orthopedic','Dermatologist','Pediatrician','ENT Specialist','Gynecologist','Neurologist'];
      let list = hospitals.map((h, i) => {
        const near = h.city.toLowerCase().includes(want) || want.includes(h.city.toLowerCase());
        const docs = doctorsFor(h._id, i);
        const stock = h.availableBloodUnits || [];
        return { ...h, distanceKm: near ? (3 + (i % 9)) : (28 + i * 7),
          units: p.bloodGroup ? (stock.find((u)=>u.bloodGroup===p.bloodGroup)?.units || 0)
                              : stock.reduce((a,u)=>a+(u.units||0),0),
          breakdown: stock, doctorCount: docs.length,
          doctors: wanted ? docs.filter((d) => wanted.includes(d.specialization)) : docs };
      });
      if (p.type) list = list.filter((h) => h.type === p.type);
      if (p.bloodGroup) list = list.filter((h) => h.units > 0);
      list.sort((a,b) => (wanted ? (b.doctors.length>0)-(a.doctors.length>0) : 0) || a.distanceKm - b.distanceKm);
      list = list.slice(0, 12);
      return { origin: { place: want.replace(/\b\w/g, (c)=>c.toUpperCase()), query: p.place },
        condition: wanted ? { id: p.condition, label: p.condition, specialisms: wanted } : null,
        bloodGroup: p.bloodGroup || '', count: list.length, results: list };
    }

    case 'doctors':
      return p.hospitalId
        ? doctorsFor(p.hospitalId, hospitals.findIndex((h) => h._id === p.hospitalId))
        : hospitals.flatMap((h, i) => doctorsFor(h._id, i)).slice(0, 40);

    case 'support': {
      if (seg[1] === 'thread') {
        // In the demo an answer arrives on its own after a few seconds, so the
        // handoff can be seen working without an admin at the other end.
        const asked = Number(sessionStorage.getItem('demo.support.at') || 0);
        const waited = Date.now() - asked;
        return waited > 8000
          ? { message: 'demo question', status: 'answered',
              reply: 'Thanks for waiting — this is what a reply from the team looks like. On the real site an administrator writes this in the console and it lands here.',
              repliedAt: new Date().toISOString() }
          : { message: 'demo question', status: 'open', reply: '' };
      }
      sessionStorage.setItem('demo.support.at', String(Date.now()));
      return { threadKey: 'demo-thread', status: 'open', createdAt: new Date().toISOString() };
    }

    case 'profile':
      return { name: 'Dhruv Shah', email: 'dhruv@example.com', phone: '09876543210', bloodGroup: 'O-', allergies: 'Penicillin', location: 'Ahmedabad', isDonor: true, emergencyContact: { name: 'Next of kin', number: '09876500000' }, qrCodePath: '' };
    default:
      return [];
  }
}

const reply = (url, config) => new Promise((res) => {
  // A touch of latency so loading states are visible in the demo.
  setTimeout(() => res({ data: resolve(url, config) }), 120);
});

const demoApi = {
  get: (url, config) => reply(url, config),
  post: (url) => reply(url),
  put: (url) => reply(url),
  delete: (url) => reply(url),
  interceptors: { request: { use() {} }, response: { use() {} } },
};

export default demoApi;
