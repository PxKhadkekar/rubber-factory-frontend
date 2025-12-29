import axios from "axios";

/**
 * Central API instance
 * - One source of truth for backend communication
 * - Automatically attaches JWT token
 * - Works in dev + production
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
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

// Optional: global response error handling (later)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can later add logout-on-401 logic here
    return Promise.reject(error);
  }
);

export default api;
