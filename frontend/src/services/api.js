import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        response: {
          data: { 
            message: 'Unable to connect to the server. Please check your internet connection.' 
          }
        }
      });
    }
    
    // Handle 401 Unauthorized errors - just reject, don't auto-logout
    // Let the auth utilities handle token validation
    if (error.response.status === 401) {
      console.warn('[API] 401 Unauthorized - Authentication required');
    }
    
    return Promise.reject(error);
  }
);

export default api;
