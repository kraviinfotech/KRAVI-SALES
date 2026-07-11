import axios from 'axios';

const API = axios.create({
  // Prefer explicit VITE_API_URL; fall back to the local backend port from backend/.env
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
  withCredentials: true,
});


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
