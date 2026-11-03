import axios from 'axios';

/**
 * Resolves the backend API base URL:
 * 1. Checks VITE_API_URL (used for production deployed HTTPS server)
 * 2. Checks EVERGROW_API_URL in localStorage (allows desktop client to point to any custom server)
 * 3. In Electron under file:// protocol, defaults to local API endpoint
 * 4. In web browser, uses relative '/api/v1' path handled by Vite/Nginx proxy
 */
export const resolveApiBaseUrl = (): string => {
  // 1. Explicit user override from Settings modal
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('EVERGROW_API_URL');
    if (customUrl && customUrl.trim().length > 0) {
      return customUrl.trim().replace(/\/+$/, '');
    }
  }

  // 2. Build-time environment variable
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 3. Electron file:// protocol fallback
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return 'http://127.0.0.1:8000/api/v1';
  }

  // 4. Default web relative path (works with Vite proxy or reverse proxy)
  return '/api/v1';
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const hasAuth =
    (typeof config.headers.get === 'function' && config.headers.get('Authorization')) ||
    config.headers.Authorization ||
    config.headers.authorization;

  if (!hasAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

// Flag to prevent multiple concurrent refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Dispatch server reachable notification
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('evergrow:server-status', {
          detail: { isOffline: false },
        })
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Detect Server Disconnection / Network Error
    if (!error.response || error.code === 'ERR_NETWORK') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('evergrow:server-status', {
            detail: { isOffline: true, message: 'Server unreachable. Reconnecting to Ever Grow campus network...' },
          })
        );
      }
      return Promise.reject(error);
    }

    // 401 Unauthorized handling with silent refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No refresh token available, terminate session cleanly
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        if (!window.location.href.includes('/login')) {
          if (window.location.protocol === 'file:') {
            window.location.hash = '#/login';
          } else {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (typeof originalRequest.headers.set === 'function') {
              originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
            } else {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${resolveApiBaseUrl()}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = refreshResponse.data.access_token;
        const newRefreshToken = refreshResponse.data.refresh_token;

        localStorage.setItem('access_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        if (typeof originalRequest.headers.set === 'function') {
          originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        } else {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');

        if (!window.location.href.includes('/login')) {
          if (window.location.protocol === 'file:') {
            window.location.hash = '#/login';
          } else {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
