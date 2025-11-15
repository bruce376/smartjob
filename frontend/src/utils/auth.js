// src/utils/auth.js

export function getToken() {
  return localStorage.getItem("token");
}

// Check if token is expired
export function isTokenExpired(token) {
  if (!token) return true;
  
  try {
    // Split the token into its parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return true;
    }
    
    // Decode the payload
    const payload = JSON.parse(atob(parts[1]));
    
    // If no exp claim exists, token never expires (as per backend implementation)
    if (payload.exp === undefined) {
      // Token has no expiration, so it's valid
      return false;
    }
    
    // JWT exp is in seconds, Date.now() is in milliseconds
    const currentTime = Date.now() / 1000; // Convert to seconds
    const expirationTime = payload.exp;
    
    // Check if token is expired
    return expirationTime < currentTime;
  } catch (err) {
    console.error('Error checking token expiration:', err);
    return true; // If we can't parse the token, consider it expired
  }
}

export function getUserFromToken() {
  // First try to get from localStorage user object (most reliable)
  const userStr = localStorage.getItem("user");
  const token = getToken();
  
  // If no token, clear any existing user data
  if (!token) {
    if (userStr) localStorage.removeItem("user");
    return null;
  }
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    // Clear expired token and user data
    localStorage.removeItem("token");
    if (userStr) localStorage.removeItem("user");
    return null;
  }

  // If we have a valid token, try to get user data from localStorage
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user) return user;
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
      // If we can't parse the user data, remove it
      localStorage.removeItem("user");
    }
  }
  
  // Fallback: decode from JWT token
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userData = { 
      id: payload.id || payload._id || payload.userId, 
      email: payload.email,
      name: payload.name,
      role: payload.role,
      ...payload 
    };
    
    // Save user data to localStorage for future use
    localStorage.setItem("user", JSON.stringify(userData));
    
    return userData;
  } catch (err) {
    console.error("Error parsing token:", err);
    return null;
  }
}

export function isLoggedIn() {
  const token = getToken();
  if (!token) return false;
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    // Clean up expired session
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }
  
  return true;
}

export function getUserRole() {
  // First try to get from localStorage user object (set during login)
  const user = getUserFromToken();
  return user?.role || null;
}

// Function to clear auth data
export function clearAuthData() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Function to set auth data after successful login
export function setAuthData(token, userData) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(userData));
}
