import axios from 'axios';

const api = axios.create({
  baseURL: '',
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
