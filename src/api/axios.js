import axios from "axios";

/**
 * Central API instance
 * - One source of truth for backend communication
 * - Automatically attaches JWT token
 * - Timeout set to 45s to allow free-tier cloud instances (Render) to wake from hibernation
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 45000,
});

// Attach token automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
