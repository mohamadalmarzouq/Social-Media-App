import { API_BASE } from '../config';
import { getToken } from './token';

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
