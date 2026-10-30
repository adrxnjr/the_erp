import axios from 'axios';

/**
 * Resolves the backend API base URL:
 * 1. Checks VITE_API_URL (used for production deployed HTTPS server)
 * 2. Checks EVERGROW_API_URL in localStorage (allows desktop client to point to any custom server)
 * 3. In Electron under file:// protocol, defaults to local API endpoint
 * 4. In web browser, uses relative '/api/v1' path handled by Vite/Nginx proxy
 */
export const resolveApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('EVERGROW_API_URL');
    if (customUrl && customUrl.trim().length > 0) {
      return customUrl.trim().replace(/\/+$/, '');
    }

    if (window.location.protocol === 'file:') {
      return 'http://127.0.0.1:8000/api/v1';
    }
  }

  return '/api/v1';
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // If request already has an explicit Authorization header, preserve it
  if (!config.headers.Authorization) {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.href.includes('login')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      if (window.location.protocol === 'file:') {
        window.location.hash = '#/login';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
