import api from '../utils/api';
import { setAuthData, clearAuthData, getToken, isTokenExpired } from '../utils/auth';

export const getCurrentUser = async () => {
  try {
    // First try to get from localStorage
    const userStr = localStorage.getItem('user');
    const token = getToken();

    // If no token, clear any existing user data
    if (!token) {
      if (userStr) localStorage.removeItem('user');
      return { error: 'No authentication token found' };
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      clearAuthData();
      return { error: 'Session expired. Please log in again.' };
    }

    // If we have cached user data, return it immediately
    // This prevents logout on page refresh
    if (userStr) {
      try {
        const cachedUser = JSON.parse(userStr);
        // Return cached data immediately, don't wait for API call
        return cachedUser;
      } catch (e) {
        console.error('Error parsing cached user:', e);
        localStorage.removeItem('user');
      }
    }

    // Try to fetch fresh user data in the background (optional)
    try {
      const response = await api.get('/auth/me');
      
      if (response.data) {
        if (response.data.error) {
          return { error: response.data.error };
        }
        
        // Update the stored user data
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching user data:', error.message);
      
      // Don't clear auth data on API errors - just log and continue
      // The user is still logged in with their token
      console.warn('Could not fetch fresh user data, but token is still valid');
      
      // Handle network errors gracefully
      if (!navigator.onLine) {
        return { error: 'Network error. Please check your connection.' };
      }
      
      return { error: error.message || 'Failed to fetch user data' };
    }
    
    return { error: 'No user data available' };
  } catch (error) {
    console.error('Unexpected error in getCurrentUser:', error);
    return { error: 'An unexpected error occurred' };
  }
};

export const updateProfile = async (userData) => {
  try {
    console.log('[updateProfile] Sending update request:', userData);
    const response = await api.put('/auth/update-profile', userData);
    
    console.log('[updateProfile] Response received:', response.data);
    
    if (response.data && response.data.user) {
      // Update cached user data with the response from server
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return { 
        success: true, 
        user: response.data.user,
        message: response.data.message || 'Profile updated successfully'
      };
    }
    
    return { success: false, error: 'Failed to update profile' };
  } catch (error) {
    console.error('[updateProfile] Error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to update profile' 
    };
  }
};

export const changePassword = async (passwordData) => {
  try {
    console.log('[changePassword] Sending password change request');
    const response = await api.put('/users/change-password', passwordData);
    
    console.log('[changePassword] Response received:', response.data);
    
    if (response.data) {
      return { 
        success: true, 
        message: response.data.message || 'Password changed successfully' 
      };
    }
    
    return { success: false, error: 'Failed to change password' };
  } catch (error) {
    console.error('[changePassword] Error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to change password' 
    };
  }
};

export const logout = () => {
  // Clear auth token and user data from local storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Optionally redirect to login page
  window.location.href = '/login';
};
