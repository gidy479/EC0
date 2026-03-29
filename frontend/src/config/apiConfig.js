const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL) 
  ? import.meta.env.VITE_API_BASE_URL 
  : (import.meta.env.MODE === 'development' ? 'http://localhost:5000' : window.location.origin);

export default API_BASE_URL;
