/**
 * utils/api.js
 * Axios instance configured to talk to the backend.
 * All auth API calls go here.
 */

import axios from 'axios';

// Base URL — Vite proxy handles /api in dev (see vite.config.js)
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,  // Send cookies (JWT httpOnly cookie) on every request
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
