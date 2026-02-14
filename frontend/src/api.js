import axios from 'axios';

/**
 * Axios instance for API calls.
 * In development: Uses '/api' which Vite proxies to the backend.
 * Automatically attaches JWT token from localStorage to every request.
 * On 401 responses, clears auth data and redirects to login.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-redirect to login on auth failure
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
