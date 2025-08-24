import { API_BASE } from '../config';
import { getToken } from './token';

// Bulletproof auth helper that ensures all endpoints use the same pattern
export async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const base = API_BASE; // same value used by the working list call
  const token = await getToken(); // same helper dashboard uses
  
  const headers: HeadersInit = {
    "content-type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  
  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers,
    // Don't include credentials for mobile JWT auth (same as working call)
    body: options.body,
  };

  if (__DEV__) {
    const h = (init.headers as Record<string, string>) || {};
    console.log('🔐 fetchWithAuth', {
      url: `${base}${path}`,
      method: init.method,
      hasAuthHeader: !!h.Authorization,
      hasCookie: !!h.Cookie,
    });
  }

  const res = await fetch(`${base}${path}`, init);
  
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.text();
      msg = body || msg;
      
      // Check for unauthorized error
      if (res.status === 401 || (body && body.includes('"error":"Unauthorized"'))) {
        console.log('🔐 Unauthorized response from server, clearing token');
        // Import and call clearToken here
        const { clearToken } = await import('./token');
        await clearToken();
      }
    } catch {}
    throw new Error(msg);
  }
  
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// Legacy apiFetch function (keeping for backward compatibility)
export const apiFetch = async (path: string, opts: RequestInit = {}): Promise<any> => {
  const token = await getToken();
  
  const headers: HeadersInit = {
    "content-type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    // Don't include credentials for mobile JWT auth
  });

  // Check content type
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  // Parse JSON
  const data = await response.json();

  // Handle error responses
  if (response.status >= 400) {
    throw new Error(JSON.stringify(data));
  }

  return data;
};

// Specific API functions using the bulletproof helper
export async function getContests() {
  return fetchWithAuth('/api/contests');
}

export async function getContestDetails(contestId: string) {
  return fetchWithAuth(`/api/contests/${contestId}/details`);
}

export async function getContestSubmissions(contestId: string) {
  return fetchWithAuth(`/api/contests/${contestId}/submissions`);
}

export async function cancelContest(contestId: string) {
  return fetchWithAuth(`/api/contests/${contestId}/cancel`, {
    method: 'POST',
  });
}

export async function acceptSubmission(submissionId: string) {
  return fetchWithAuth(`/api/submissions/${submissionId}/accept`, {
    method: 'POST',
  });
}

export async function passSubmission(submissionId: string) {
  return fetchWithAuth(`/api/submissions/${submissionId}/pass`, {
    method: 'POST',
  });
}

export async function createContest(contestData: any) {
  return fetchWithAuth('/api/contests', {
    method: 'POST',
    body: JSON.stringify(contestData),
  });
}

export async function getWork() {
  return fetchWithAuth('/api/work');
}
