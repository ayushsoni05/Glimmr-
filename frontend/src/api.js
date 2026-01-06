import axios from 'axios';

// Use a relative API path by default so Vite's dev server proxy handles backend requests.
// This avoids hard-coding backend ports and prevents ERR_CONNECTION_REFUSED when backend
// moves between ports during local development.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Debug: surface the resolved base URL
console.debug('[api] baseURL =', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for order processing with live rates
});

// Add request interceptor to automatically include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor to handle 401/403 gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    const message = error?.response?.data?.error || '';

    // Treat unauthorized/forbidden as auth expiration
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      window.dispatchEvent(new Event('auth-change'));
    }

    // If admin endpoints return 404 because user missing, clear stale auth too
    if (status === 404 && (url.startsWith('/admin') || url.includes('/admin/')) && /user not found/i.test(message)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      window.dispatchEvent(new Event('auth-change'));
    }

    return Promise.reject(error);
  }
);

export default api;
