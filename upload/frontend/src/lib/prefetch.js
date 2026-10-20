// ROUTE PREFETCHING
//
// POINT 5: "some pages take some time to load."
//
// The site is split per route, which is why the first screen is quick — but
// it also means every link is a fresh network request for a JavaScript chunk
// before anything at all can be drawn. On a phone on mobile data that is the
// pause people noticed.
//
// Two things fix it without making the first load any heavier:
//
//   1. On hover or touch-start over a link, fetch that route's chunk. By the
//      time the click lands, it is usually already in the browser's cache.
//      Hover-to-click is 150–300ms; a chunk here is a few kilobytes.
//   2. Once the browser is idle, quietly pull in the handful of pages people
//      go to next anyway.
//
// These are the same import specifiers App.jsx uses, so the bundler resolves
// them to the same chunks — prefetching warms them, it does not duplicate
// them.

const ROUTES = {
  '/': () => import('../pages/Home'),
  '/dashboard': () => import('../pages/Dashboard'),
  '/profile': () => import('../pages/Profile'),
  '/donors': () => import('../pages/DonorSearch'),
  '/hospitals': () => import('../pages/Hospitals'),
  '/appointments': () => import('../pages/Appointments'),
  '/requests': () => import('../pages/DonationRequests'),
  '/availability': () => import('../pages/Availability'),
  '/near-me': () => import('../pages/NearMe'),
  '/camps': () => import('../pages/Camps'),
  '/stories': () => import('../pages/Stories'),
  '/guides': () => import('../pages/Guides'),
  '/leaderboard': () => import('../pages/Leaderboard'),
  '/blogs': () => import('../pages/Blogs'),
  '/my-donations': () => import('../pages/MyDonations'),
  '/login': () => import('../pages/Login'),
  '/register': () => import('../pages/Register'),
};

const done = new Set();

// A chunk that fails to prefetch is not an error worth surfacing: the real
// navigation will ask for it again, and that one does report failures.
export function prefetchRoute(path) {
  if (!path) return;
  // "/camps/abc" is still the camps chunk's job to load first.
  const key = `/${String(path).split('?')[0].split('/').filter(Boolean)[0] || ''}`;
  const load = ROUTES[path] || ROUTES[key];
  if (!load || done.has(load)) return;
  done.add(load);
  load().catch(() => done.delete(load));
}

// The pages a member opens next, warmed while nothing else is happening.
const COMMON = ['/dashboard', '/requests', '/donors', '/hospitals', '/near-me'];

export function prefetchCommon() {
  const run = () => COMMON.forEach(prefetchRoute);
  if (typeof window === 'undefined') return;
  // Never compete with the page that is actually on screen.
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 2200);
}

// Handy as a spread onto any <Link>: onMouseEnter / onTouchStart / onFocus.
export const prefetchProps = (to) => ({
  onMouseEnter: () => prefetchRoute(to),
  onFocus: () => prefetchRoute(to),
  onTouchStart: () => prefetchRoute(to),
});
