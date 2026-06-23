import axios from 'axios';

const API = axios.create({
  // Prefer explicit VITE_API_URL; fall back to the local backend port from backend/.env
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
});


// Request interceptor to automatically add authorization header
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to log server errors for easier debugging
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Attach friendly logging so devs can see server stack in browser console
    if (error.response) {
      console.error('API Error:', {
        url: error.config && error.config.url,
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.error('API Network/Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default API;
