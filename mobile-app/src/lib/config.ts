// API configuration for the mobile app
// This should match your web app's backend URL exactly
export const API_BASE_URL = 'https://social-media-app-0787.onrender.com';

// API endpoints - these should match exactly what the web app uses
export const API_ENDPOINTS = {
  // Auth endpoints - using exact paths from web app
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
