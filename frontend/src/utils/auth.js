export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const isTokenExpired = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return true;
  }
  
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < (currentTime + 60);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

export const getTokenTimeRemaining = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return 0;
  }
  
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }
    
    const currentTime = Date.now() / 1000;
    const timeRemaining = decoded.exp - currentTime;
    
    return Math.max(0, Math.floor(timeRemaining));
  } catch (error) {
    return 0;
  }
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !isTokenExpired();
};