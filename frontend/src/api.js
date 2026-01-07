import axios from 'axios';

// Use a relative API path by default so Vite's dev server proxy handles backend requests.
// This avoids hard-coding backend ports and prevents ERR_CONNECTION_REFUSED when backend
// moves between ports during local development.
let API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Production fallback: if no env var is set and we're on the deployed domain, use the backend URL
if (API_BASE_URL === '/api' && typeof window !== 'undefined' && window.location.hostname.includes('render.com')) {
  API_BASE_URL = 'https://glimmr-jewellry-e-commerce-platform-5.onrender.com/api';
  console.log('[api] Using production backend fallback');
}

// If VITE_API_URL is a full URL without /api suffix, add it automatically
if (API_BASE_URL.startsWith('http')) {
  // Remove any trailing slashes first
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, '');
  // Add /api if not present
  if (!API_BASE_URL.endsWith('/api')) {
    API_BASE_URL = API_BASE_URL + '/api';
  }
}

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
