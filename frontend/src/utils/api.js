import axios from "axios";

const api = axios.create({
  baseURL: "https://preplytics-backend-yw6r.onrender.com/api",
  withCredentials: true,
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;