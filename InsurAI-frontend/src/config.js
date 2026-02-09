// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Helper function to construct full API URLs
export const getApiUrl = (path) => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};

// Export for use in components
export default {
  API_BASE_URL,
  getApiUrl
};

