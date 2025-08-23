// API configuration for the mobile app
// This should match your web app's backend URL exactly
export const API_BASE_URL = 'https://social-media-app-o787.onrender.com';

// API endpoints - these should match exactly what the web app uses
export const API_ENDPOINTS = {
  // Mobile auth endpoints - using new JWT-based system
  MOBILE_LOGIN: '/api/mobile/login',
  MOBILE_ME: '/api/mobile/me',
  MOBILE_HEALTH: '/api/mobile/health',
  
  // Legacy auth endpoints (keeping for backward compatibility)
  SIGNIN: '/api/auth/signin',
  SIGNUP: '/api/auth/signup',
  SIGNOUT: '/api/auth/signout',
  CHECK_SESSION: '/api/auth/check-session',
  
  // Health check
  HEALTH: '/api/health',
  
  // Other endpoints can be added as needed
  CONTESTS: '/api/contests',
  SUBMISSIONS: '/api/submissions',
};
