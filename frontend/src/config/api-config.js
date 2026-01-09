// API Configuration for different environments
const API_CONFIG = {
  development: {
    BASE_URL: 'http://localhost:5000/api',
    DEBUG: true
  },
  production: {
    BASE_URL: 'https://smartjob-ooo2.onrender.com/api',
    DEBUG: false
  }
};

// Determine current environment
const getEnvironment = () => {
  // Check if we're on Firebase Hosting
  if (window.location.hostname.includes('web.app') || 
      window.location.hostname.includes('firebaseapp.com')) {
    return 'production';
  }
  
  // Check if we're on Netlify
  if (window.location.hostname.includes('netlify.app')) {
    return 'production';
  }
  
  // Default to development
  return 'development';
};

const currentEnv = getEnvironment();
export const API_BASE_URL = API_CONFIG[currentEnv].BASE_URL;
export const DEBUG_MODE = API_CONFIG[currentEnv].DEBUG;

console.log(`[API Config] Environment: ${currentEnv}, Base URL: ${API_BASE_URL}`);
