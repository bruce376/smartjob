// src/utils/api.js
import axios from "axios";

// Ensure the base URL is properly formatted
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
// Remove any trailing slashes and then ensure it doesn't end with /api to prevent duplicates
API_BASE_URL = API_BASE_URL.replace(/\/+$/, '');
// Only add /api if it's not already in the URL
if (!API_BASE_URL.endsWith('/api') && !API_BASE_URL.includes('/api/')) {
  API_BASE_URL = `${API_BASE_URL}/api`;
}

const DEBUG_MODE = import.meta.env.VITE_DEBUG === 'true';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    if (DEBUG_MODE) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }
    return config;
  },
  (error) => {
    if (DEBUG_MODE) {
      console.error('[API] Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and logging
api.interceptors.response.use(
  (response) => {
    if (DEBUG_MODE) {
      console.log(`[API] ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Skip logging for specific routes that might fail without being an error
    const skipLogging = [
      '/auth/me', // Don't log 401 for auth/me as it's used to check login status
    ].some(route => error.config?.url?.includes(route));

    if (DEBUG_MODE && !skipLogging) {
      console.error('[API] Response Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      
      console.warn('[API] 401 Unauthorized:', url);
      
      // Don't automatically log out - let the auth utilities handle token validation
      // Just reject promise with an error message
      return Promise.reject(new Error('Authentication required. Please log in.'));
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      return Promise.reject({
        message: 'You do not have permission to perform this action.',
        isForbidden: true,
        data: error.response?.data
      });
    }

    // Handle undefined response
    if (!error.response) {
      return Promise.reject({
        message: 'An unknown error occurred.',
        error: error.message,
      });
    }

    // For other errors, just reject with error
    return Promise.reject(error);
  }
);

// Auth API
export const login = async ({ email, password, role }) => {
  try {
    const response = await api.post("/auth/login", { email, password, role });
    
    if (!response.data || !response.data.token) {
      throw new Error('Invalid response from server');
    }
    
    // Store token and user data
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set auth token for API requests
    setAuthToken(token);
    
    return { token, user };
  } catch (error) {
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.response) {
      // Handle specific error messages from the server
      if (error.response.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response.status === 403) {
        errorMessage = 'You do not have permission to access this resource';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message === 'Network Error') {
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    
    // Store token and user data if available
    const { token, user } = response.data;
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set auth token for API requests
      setAuthToken(token);
    }
    
    return response.data;
  } catch (error) {
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

// Auth Helpers
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Set auth token for all requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Request interceptor to add the authorization token
api.interceptors.request.use(
  (config) => {
    // Only skip adding token for login/register/google auth requests
    const publicAuthEndpoints = ['/auth/login', '/auth/register', '/auth/google'];
    const isPublicAuth = publicAuthEndpoints.some(endpoint => config.url.includes(endpoint));
    
    if (isPublicAuth) {
      return config;
    }
    
    // Add token for all other requests including /auth/me, /auth/update-profile, etc.
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

// CV Upload API
export const uploadCV = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please log in to upload a CV');
    }

    const response = await api.post('/upload/cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${progress}%`);
      },
    });

    return response.data;
  } catch (error) {
    console.error('CV Upload Error:', error);
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'Failed to upload CV';
    throw new Error(errorMessage);
  }
};

// Initialize auth token
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

export default api;
