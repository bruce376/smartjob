/**
 * WordPress Integration Utilities
 * Improves communication between the React app and WordPress when embedded in an iframe
 */

// Check if the app is running inside an iframe
export const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true; // If we can't access parent, we're in a cross-origin iframe
  }
};

// Send messages to the WordPress parent page
export const sendToWordPress = (messageType, data) => {
  if (!isInIframe()) return false;
  
  try {
    // Send message to parent
    window.parent.postMessage({
      type: messageType,
      ...data
    }, '*'); // In production, replace '*' with your WordPress domain for security
    return true;
  } catch (e) {
    console.error('Error sending message to WordPress:', e);
    return false;
  }
};

// Update the page title in WordPress
export const updatePageTitle = (title) => {
  return sendToWordPress('setTitle', { title });
};

// Handle navigation - help WordPress know about URL changes
export const notifyNavigation = (path, title) => {
  return sendToWordPress('navigation', { 
    path, 
    title 
  });
};

export default {
  isInIframe,
  sendToWordPress,
  updatePageTitle,
  notifyNavigation
};
