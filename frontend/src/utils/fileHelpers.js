/**
 * Constructs a full URL for accessing uploaded files
 * @param {string} filePath - The relative file path (e.g., /uploads/cv-123.pdf)
 * @returns {string} - The full URL to access the file
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  
  // If already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // Get base URL from environment variable or use default
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const baseUrl = apiBaseUrl.replace('/api', '');
  
  // Ensure filePath starts with /
  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  
  return `${baseUrl}${normalizedPath}`;
};

/**
 * Opens a file in a new browser tab
 * @param {string} filePath - The relative or absolute file path
 * @param {Function} onError - Optional error callback
 */
export const openFileInNewTab = (filePath, onError) => {
  try {
    if (!filePath) {
      throw new Error('No file path provided');
    }
    
    const fileUrl = getFileUrl(filePath);
    console.log('Opening file:', fileUrl);
    
    const newWindow = window.open(fileUrl, '_blank');
    
    // Check if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }
  } catch (error) {
    console.error('Error opening file:', error);
    if (onError) {
      onError(error);
    } else {
      alert(error.message || 'Unable to open file. Please try again.');
    }
  }
};

/**
 * Downloads a file using fetch and blob to force download
 * @param {string} filePath - The relative or absolute file path
 * @param {string} filename - Optional custom filename for download
 */
export const downloadFile = async (filePath, filename) => {
  try {
    const fileUrl = getFileUrl(filePath);
    const defaultFilename = filename || filePath.split('/').pop() || 'download';
    
    console.log('Downloading file:', fileUrl);
    
    // Fetch the file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    // Create blob from response
    const blob = await response.blob();
    
    // Create download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL
    window.URL.revokeObjectURL(downloadUrl);
    
    console.log('File downloaded successfully:', defaultFilename);
  } catch (error) {
    console.error('Error downloading file:', error);
    alert(error.message || 'Unable to download file. Please try again.');
    throw error;
  }
};
