// A single, shared Axios "instance" for the whole app.
// It automatically attaches the JWT token (if we have one) to every request.

import axios from 'axios';

// Local pe chalega toh localhost:5000 use karega,
// Live (Vercel) pe VITE_API_URL environment variable use karega.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
