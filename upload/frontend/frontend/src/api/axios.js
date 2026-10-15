// Shared Axios instance for the PUBLIC / USER side of LifeLink.
// It only ever sends the user token. The admin panel has its own client
// (api/adminApi.js) with its own token, so the two sessions never mix.

import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const USER_TOKEN_KEY = 'lifelink.user.token';
export const USER_KEY = 'lifelink.user';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(USER_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // An expired/!valid user session should drop straight back to the login page.
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    return Promise.reject(error);
  }
);

export default api;
