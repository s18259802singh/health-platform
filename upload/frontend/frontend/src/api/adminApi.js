// Axios instance used ONLY inside the admin panel.
// Separate token key, separate storage, separate redirect target - signing out
// of the admin console does not touch a user session in the same browser, and
// vice versa.

import axios from 'axios';
import { API_BASE_URL } from './axios';

export const ADMIN_TOKEN_KEY = 'lifelink.admin.token';
export const ADMIN_KEY = 'lifelink.admin';

const adminApi = axios.create({ baseURL: API_BASE_URL });

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
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
