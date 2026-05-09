import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || '';

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('zygerria_token');
      localStorage.removeItem('zygerria_user');
    }
    return Promise.reject(error);
  }
);

export default api;
