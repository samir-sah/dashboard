import { API_CONFIG } from '@/config/api.config';

const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token'); // adjust to your auth flow

  const res = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'API error');
  }

  return res.json();
};

export default apiFetch;