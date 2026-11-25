// THE ADMIN CONSOLE, IN THE STANDALONE PREVIEW.
//
// The preview build runs with no backend. The member side already had a
// stand-in (api/demo.js), but the console did not — so opening /admin in a
// preview got you a sign-in form that nothing could satisfy, and the whole
// back half of the product was invisible to anybody reviewing it.
//
// This answers the console's requests from the same fixtures the member side
// uses, so a reviewer can walk through every screen. Writes are accepted and
// held in memory for the session: a camp you approve here really does leave
// the queue, and comes back when the page is reloaded. Nothing persists,
// because there is nothing to persist to.
//
// It is switched on only by VITE_DEMO=true at build time. The normal
// production build never imports it.

import demoApi, { demoState } from './demo';

const clone = (v) => JSON.parse(JSON.stringify(v));
const ok = (data) => Promise.resolve({ data, status: 200 });

const err = (status, message) => {
  const e = new Error(message);
  e.response = { status, data: { message } };
  return Promise.reject(e);
};

// ---------------------------------------------------------------- state --
// Seeded from the member fixtures on first use, then mutated in place so the
// console behaves like a console: a delete removes a row, an edit shows up.
let store = null;

const seed = () => {
  if (store) return store;
  const s = demoState();
  store = {
    users: s.donors.map((d, i) => ({
      _id: `u${i}`,
      name: d.name,
      email: `${d.name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
      phone: `09${700000000 + i * 137}`,
      // Weighted the way the register actually is, so the console's
      // "donors vs open requests" chart shows the negatives as the scarce
      // ones rather than eight identical bars - which would contradict
      // everything the rest of the site says.
      bloodGroup: ['O+', 'B+', 'A+', 'O+', 'B+', 'A+', 'AB+', 'O+', 'B+', 'A-',
        'O-', 'B-', 'A+', 'AB-', 'O+', 'B+'][i % 16],
      location: d.city,
      isDonor: true,
      role: i === 0 ? 'admin' : 'user',
      createdAt: new Date(Date.now() - i * 6 * 864e5).toISOString(),
    })),
    hospitals: clone(s.hospitals),
    doctors: clone(s.doctors),
    camps: clone(s.camps),
    requests: clone(s.requests),
    appointments: clone(s.appointments),
    blogs: clone(s.blogs),
    stories: clone(s.stories),
    guides: clone(s.guides),
    donations: clone(s.myDonations).map((d, i) => ({
      ...d, _id: `ad${i}`, userId: { name: s.donors[i % s.donors.length].name },
    })),
    support: clone(s.support || []),
  };
  return store;
};

const overview = () => {
  const d = seed();
  const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const since = new Date();
  since.setDate(since.getDate() - 13);

  return {
    counts: {
      totalUsers: d.users.length,
      totalDonors: d.users.filter((u) => u.isDonor).length,
      totalAdmins: d.users.filter((u) => u.role === 'admin').length,
      totalHospitals: d.hospitals.filter((h) => h.type === 'hospital').length,
      totalBloodBanks: d.hospitals.filter((h) => h.type === 'blood_bank').length,
      totalDoctors: d.doctors.length,
      totalBlogs: d.blogs.length,
      pendingRequests: d.requests.filter((r) => r.status === 'pending').length,
      fulfilledRequests: d.requests.filter((r) => r.status === 'fulfilled').length,
      totalAppointments: d.appointments.length,
      pendingAppointments: d.appointments.filter((a) => a.status === 'pending').length,
    },
    bloodGroups: GROUPS.map((g) => ({
      group: g,
      donors: d.users.filter((u) => u.bloodGroup === g).length,
      pendingRequests: d.requests.filter((r) => r.status === 'pending' && r.bloodGroupNeeded === g).length,
    })),
    signupTrend: Array.from({ length: 14 }, (_, i) => {
      const day = new Date(since);
      day.setDate(day.getDate() + i);
      return { date: day.toISOString().slice(0, 10), count: (i * 7 + 3) % 9 };
    }),
    topCities: [...d.users.reduce((m, u) => m.set(u.location, (m.get(u.location) || 0) + 1), new Map())]
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    recentUsers: d.users.slice(0, 6),
    recentRequests: d.requests.slice(0, 6),
  };
};

// ------------------------------------------------------------- the router --
const byId = (list, id) => list.find((x) => String(x._id) === String(id));
const dropById = (list, id) => {
  const i = list.findIndex((x) => String(x._id) === String(id));
  if (i >= 0) list.splice(i, 1);
  return i >= 0;
};
const newId = () => `d${Math.random().toString(36).slice(2, 9)}`;

function route(method, path, body = {}) {
  const d = seed();
  const seg = path.split('?')[0].split('/').filter(Boolean);   // ['admin','camps','x']

  // /blogs and /hospitals are shared with the public API
  if (seg[0] !== 'admin') {
    const list = seg[0] === 'blogs' ? d.blogs : seg[0] === 'hospitals' ? d.hospitals : null;
    if (!list) return demoApi.request({ method, url: `/${seg.join('/')}`, data: body });
    if (method === 'get') return ok(seg[1] ? byId(list, seg[1]) : list);
    if (method === 'post') { const row = { _id: newId(), ...body }; list.unshift(row); return ok(row); }
    if (method === 'put') {
      const row = byId(list, seg[1]);
      if (!row) return err(404, 'Not found');
      Object.assign(row, body);
      return ok(row);
    }
    if (method === 'delete') return dropById(list, seg[1]) ? ok({ message: 'Deleted' }) : err(404, 'Not found');
  }

  const what = seg[1];
  const id = seg[2];
  const action = seg[3];

  if (what === 'login') {
    return ok({ token: 'demo-admin', admin: { id: 'demo', name: 'Demo Administrator', email: body.email || 'admin@lifelink.test', role: 'admin' } });
  }
  if (what === 'me') return ok({ id: 'demo', name: 'Demo Administrator', role: 'admin' });
  if (what === 'overview') return ok(overview());
  if (what === 'seed') return ok({ message: 'Reseeded (preview only — nothing was written)' });
  if (what === 'certificates') return ok({ issued: 0, message: 'Preview only' });

  const LISTS = {
    users: d.users,
    hospitals: d.hospitals,
    doctors: d.doctors,
    camps: d.camps,
    requests: d.requests,
    appointments: d.appointments,
    blogs: d.blogs,
    stories: d.stories,
    guides: d.guides,
    donations: d.donations,
    support: d.support,
  };
  const list = LISTS[what];
  if (!list) return err(404, `No preview data for /${seg.join('/')}`);

  // ---- sub-actions on one row -------------------------------------------
  if (id && action) {
    const row = byId(list, id);
    if (!row) return err(404, 'Not found');

    if (what === 'camps' && action === 'registrations') {
      return ok({ ...row, registrations: row.registrations || [] });
    }
    if (what === 'camps' && action === 'approve') { row.status = 'upcoming'; row.reviewNote = body.note || ''; return ok(row); }
    if (what === 'camps' && action === 'reject') { row.status = 'rejected'; row.reviewNote = body.note || ''; return ok(row); }
    if (what === 'donations' && action === 'certificate') {
      row.certificateIssued = method !== 'delete';
      return ok(row);
    }
    if (what === 'support' && action === 'reply') {
      row.messages = [...(row.messages || []), { from: 'admin', body: body.body || '', at: new Date().toISOString() }];
      return ok(row);
    }
    if (what === 'support') { row.status = action === 'close' ? 'closed' : 'open'; return ok(row); }
    return ok(row);
  }

  // ---- plain CRUD --------------------------------------------------------
  if (method === 'get') {
    if (id) return ok(byId(list, id));
    // Two endpoints send an envelope rather than a bare array, and the
    // pages read the extra fields off it. Returning the array alone made
    // the support inbox read `data.rows.filter` on undefined and take the
    // whole console down with it.
    if (what === 'support') {
      const rows = body.status ? list.filter((r) => r.status === body.status) : list;
      return ok({ rows, openCount: list.filter((r) => r.status === 'open').length });
    }
    if (what === 'users') return ok({ items: list, total: list.length });
    return ok(list);
  }
  if (method === 'post') { const row = { _id: newId(), createdAt: new Date().toISOString(), ...body }; list.unshift(row); return ok(row); }
  if (method === 'put') {
    const row = byId(list, id);
    if (!row) return err(404, 'Not found');
    Object.assign(row, body);
    return ok(row);
  }
  if (method === 'delete') return dropById(list, id) ? ok({ message: 'Deleted' }) : err(404, 'Not found');

  return err(405, 'Not supported in the preview');
}

const call = (method) => (url, a, b) => {
  // axios signatures differ: get/delete take (url, config), post/put take
  // (url, data, config).
  const isBody = method === 'post' || method === 'put';
  const body = isBody ? (a || {}) : (a?.params || {});
  return route(method, String(url), body);
};

const adminDemo = {
  get: call('get'),
  post: call('post'),
  put: call('put'),
  delete: call('delete'),
  request: ({ method = 'get', url, data }) => route(String(method).toLowerCase(), String(url), data || {}),
  interceptors: { request: { use() {} }, response: { use() {} } },
  defaults: { headers: { common: {} } },
};

export default adminDemo;
