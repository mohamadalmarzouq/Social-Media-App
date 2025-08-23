import { API_BASE_URL, API_ENDPOINTS } from './config';

// Helper function to safely parse JSON or get text
export const jsonOrText = async (res: Response) => {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }
  const text = await res.text();
  throw new Error(text || `HTTP ${res.status}`);
};

// Helper function to handle non-OK responses
export const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res;
};

// Helper function to get auth headers for mobile app (JWT-based)
export const getAuthHeaders = (token?: string): Record<string, string> => {
  if (!token) {
    console.log('🔐 No token provided, returning basic headers');
    return {};
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
  };
  
  console.log('🔐 Generated JWT headers:', headers);
  return headers;
};

// Test backend connectivity
export const testBackendConnectivity = async () => {
  console.log('🧪 Testing backend connectivity...');
  
  try {
    // Test basic fetch to the base URL
    const response = await fetch(API_BASE_URL);
    console.log('✅ Base URL response:', response.status, response.statusText);
    
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    console.log('✅ Health endpoint response:', healthResponse.status, healthResponse.statusText);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('✅ Health data:', healthData);
    }
    
    // Test mobile health endpoint
    const mobileHealthResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MOBILE_HEALTH}`);
    console.log('✅ Mobile health endpoint response:', mobileHealthResponse.status, mobileHealthResponse.statusText);
    
    if (mobileHealthResponse.ok) {
      const mobileHealthData = await mobileHealthResponse.text();
      console.log('✅ Mobile health data:', mobileHealthData);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Backend connectivity test failed:', error);
    return false;
  }
};

// Helper function to make API calls with JWT authentication
export const apiCall = async (endpoint: string, options: RequestInit = {}, token?: string) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('🌐 API Call Details:');
  console.log('  URL:', url);
  console.log('  Method:', options.method || 'GET');
  console.log('  Headers:', options.headers);
  console.log('  Body:', options.body);
  console.log('  Token:', token ? 'Present' : 'No token');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...getAuthHeaders(token), // Include JWT auth headers
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log('📡 Making fetch request...');
    const response = await fetch(url, defaultOptions);
    
    console.log('📥 Response received:');
    console.log('  Status:', response.status);
    console.log('  Status Text:', response.statusText);
    console.log('  Headers:', Object.fromEntries(response.headers.entries()));
    console.log('  URL:', response.url);
    
    // Check if response is OK before trying to parse
    if (!response.ok) {
      console.log('❌ Response not OK, reading text...');
      const text = await response.text();
      console.log('  Error Response Text:', text);
      throw new Error(text || `HTTP ${response.status}`);
    }

    // Try to parse as JSON, fallback to text
    try {
      console.log('🔍 Attempting to parse JSON...');
      const data = await response.json();
      console.log('✅ JSON parsed successfully:', data);
      return data;
    } catch (error) {
      console.log('❌ JSON parsing failed, reading text...');
      const text = await response.text();
      console.log('  Raw Response Text:', text);
      throw new Error(`Invalid JSON response: ${text}`);
    }
  } catch (error) {
    console.log('💥 API call failed:', error);
    throw error;
  }
};

// Mobile auth API functions (JWT-based)
export const mobileAuthAPI = {
  login: async (email: string, password: string) => {
    return apiCall(API_ENDPOINTS.MOBILE_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  me: async (token: string) => {
    return apiCall(API_ENDPOINTS.MOBILE_ME, {}, token);
  },

  health: async () => {
    return apiCall(API_ENDPOINTS.MOBILE_HEALTH);
  },
};

// Legacy auth API functions (keeping for backward compatibility)
export const authAPI = {
  signIn: async (email: string, password: string) => {
    return apiCall(API_ENDPOINTS.SIGNIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  signUp: async (name: string, email: string, password: string, role: string) => {
    return apiCall(API_ENDPOINTS.SIGNUP, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  signOut: async () => {
    return apiCall(API_ENDPOINTS.SIGNOUT, {
      method: 'POST',
    });
  },

  checkSession: async () => {
    return apiCall(API_ENDPOINTS.CHECK_SESSION);
  },

  health: async () => {
    return apiCall(API_ENDPOINTS.HEALTH);
  },
};

// Contest API functions (now using JWT tokens)
export const contestAPI = {
  getContests: async (token: string) => {
    return apiCall('/api/contests', {}, token);
  },

  getContestDetails: async (contestId: string, token: string) => {
    return apiCall(`/api/contests/${contestId}/details`, {}, token);
  },

  createContest: async (contestData: any, token: string) => {
    return apiCall('/api/contests', {
      method: 'POST',
      body: JSON.stringify(contestData),
    }, token);
  },

  cancelContest: async (contestId: string, token: string) => {
    return apiCall(`/api/contests/${contestId}/cancel`, {
      method: 'POST',
    }, token);
  },
};

// Work API functions (now using JWT tokens)
export const workAPI = {
  getWork: async (token: string) => {
    return apiCall('/api/work', {}, token);
  },
};
