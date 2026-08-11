// src/axios.js
import axios from 'axios';
import store from './store';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor – attach token if exists
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor – refresh token on 401 and retry once
api.interceptors.response.use(
  response => response,

  async error => {
    const originalRequest = error.config;

    // Check if 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await store.dispatch('auth/refreshToken');

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch('auth/logout');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;