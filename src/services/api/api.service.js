import { API_CONFIG } from '@/config/api.config';

const apiFetch = async (endpoint, options = {}) => {
  const res = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'API error');
  }

  return res.json();
};

export default apiFetch;
