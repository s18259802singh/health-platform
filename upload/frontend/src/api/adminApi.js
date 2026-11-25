// Axios instance used ONLY inside the admin panel.
// Separate token key, separate storage, separate redirect target - signing out
// of the admin console does not touch a user session in the same browser, and
// vice versa.

import axios from 'axios';
import { API_BASE_URL, DEMO } from './axios';
import adminDemo from './adminDemo';

export const ADMIN_TOKEN_KEY = 'lifelink.admin.token';
export const ADMIN_KEY = 'lifelink.admin';

const realAdminApi = axios.create({ baseURL: API_BASE_URL });

// The standalone preview has no backend. Without this the console's sign-in
// form could never be satisfied and the whole back half of the product was
// invisible to anyone reviewing a preview link. See api/adminDemo.js.
const adminApi = DEMO ? adminDemo : realAdminApi;

realAdminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

realAdminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_KEY);
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.replace('/admin/login?expired=1');
      }
    }
    return Promise.reject(error);
  }
);

export default adminApi;
