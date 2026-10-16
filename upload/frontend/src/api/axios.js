// Shared Axios instance for the PUBLIC / USER side of LifeLink.
// It only ever sends the user token. The admin panel has its own client
// (api/adminApi.js) with its own token, so the two sessions never mix.

import axios from 'axios';
import demoApi from './demo';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// VITE_DEMO=true builds a standalone copy that runs with no backend, for
// showing the design. It is off in every normal build.
export const DEMO = import.meta.env.VITE_DEMO === 'true';

export const USER_TOKEN_KEY = 'lifelink.user.token';
export const USER_KEY = 'lifelink.user';

const realApi = axios.create({ baseURL: API_BASE_URL });
const api = DEMO ? demoApi : realApi;

// ---------------------------------------------------------------- wake-up
// The API is hosted on a plan that puts the server to sleep after a quiet
// spell. The first request afterwards has to start it again, which can take
// the best part of a minute — during which the pages render instantly and
// then sit on empty loading states, which reads as "the site is broken".
//
// So: if any request is still outstanding after 2.5 seconds, say so. This
// does not make the server any faster; it replaces an unexplained wait with
// an explained one, and that is the part that was actually costing trust.
const WAKE_AFTER_MS = 2500;
let inFlight = 0;
let wakeTimer = null;
let waking = false;
const listeners = new Set();

export const onServerWaking = (fn) => {
  listeners.add(fn);
  fn(waking);
  return () => listeners.delete(fn);
};

const setWaking = (next) => {
  if (waking === next) return;
  waking = next;
  listeners.forEach((fn) => fn(waking));
};

const started = () => {
  inFlight += 1;
  if (inFlight === 1) {
    clearTimeout(wakeTimer);
    wakeTimer = setTimeout(() => setWaking(true), WAKE_AFTER_MS);
  }
};

const finished = () => {
  inFlight = Math.max(0, inFlight - 1);
  if (inFlight === 0) {
    clearTimeout(wakeTimer);
    setWaking(false);
  }
};

realApi.interceptors.request.use((config) => {
  started();
  const token = localStorage.getItem(USER_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

realApi.interceptors.response.use(
  (res) => { finished(); return res; },
  (error) => {
    finished();
    // An expired/!valid user session should drop straight back to the login page.
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    return Promise.reject(error);
  }
);

export default api;
