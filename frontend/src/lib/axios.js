import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', 
});

// Request Interceptor - Attach JWT Token
api.interceptors.request.use(
  (config) => {
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

// Response Interceptor - Handle 401/403 Globally
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized (Invalid Token)
    if (error.response && error.response.status === 401) {
      console.warn('401 Unauthorized - Token is invalid or missing');
      
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // 403 Forbidden: The user is logged in, but lacks permission OR the token expired.
    if (error.response && error.response.status === 403) {
      console.warn('403 Forbidden - Token expired or insufficient permissions');
      
      // Check if it's a token expiration issue (vs permission issue)
      // If the error message indicates session expiry, handle it
      const isTokenExpired = error.response.data?.message?.toLowerCase().includes('expired') ||
                             error.response.data?.error?.toLowerCase().includes('expired');
      
      if (isTokenExpired || !localStorage.getItem('token')) {
        // Clean up local storage so the UI knows the user is logged out.
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        
        // Don't auto-redirect for 403 - let the component handle it
        // This allows checkout page to show the session expired modal
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;