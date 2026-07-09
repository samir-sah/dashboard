import { API_CONFIG } from '@/config/api.config';

// ── Silent token refresh ────────────────────────────────────────────────
// When an access token expires the backend returns 401.  We attempt a
// single refresh call and, on success, transparently retry the original
// request.  A promise-lock prevents concurrent 401s from spawning
// multiple refresh requests.

let refreshPromise = null;

const attemptRefresh = async () => {
  // If a refresh is already in-flight, piggyback on it.
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_CONFIG.baseURL}/api/auth-dashboard/refresh-token`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => {
    refreshPromise = null;
    return res.ok;
  }).catch(() => {
    refreshPromise = null;
    return false;
  });

  return refreshPromise;
};

// ── Core fetch wrapper ──────────────────────────────────────────────────
const apiFetch = async (endpoint, options = {}) => {
  const doFetch = () =>
    fetch(`${API_CONFIG.baseURL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

  let res = await doFetch();

  // 401 = access token missing or expired → try refreshing once
  if (res.status === 401) {
    const refreshed = await attemptRefresh();

    if (refreshed) {
      // Retry original request with the new access cookie
      res = await doFetch();
    } else {
      // Refresh failed → session is truly gone, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Redirecting to login.');
    }
  }

  // 403 = invalid/tampered token → no point refreshing, go to login
  if (res.status === 403) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Authentication failed. Redirecting to login.');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'API error');
  }

  return res.json();
};

export default apiFetch;
