import axios from "axios";

const api = axios.create({
  baseURL: "https://preplytics-backend-yw6r.onrender.com/api",
  withCredentials: true,
});

export default api;