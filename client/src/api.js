// src/api.js
import axios from 'axios';
import { tryRefresh } from './auth/refresh';

export const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true
});

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshed = await tryRefresh();
      if (refreshed) {
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);
