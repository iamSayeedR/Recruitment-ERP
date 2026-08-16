/**
 * api-client.ts — High-Performance Direct-Service API client for Recruitment ERP.
 *
 * Direct Microservice Routing:
 * Bypasses Next.js proxy rewrites and browser extension interceptors (`requests.js`)
 * that cause 400 Bad Request errors on relative endpoint fetches.
 */

export class ApiError extends Error {
  constructor(public status: number, public data: any) {
    super(data?.message || `API Error ${status}`);
  }
}

// Module-level token cache with expiration check
let cachedToken: string | null = null;
let tokenFetchPromise: Promise<string | null> | null = null;

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1] || ''));
    if (payload.exp) {
      return (payload.exp * 1000) < (Date.now() + 10000);
    }
  } catch {
    return false;
  }
  return false;
}

async function fetchAccessToken(): Promise<string | null> {
  if (tokenFetchPromise) return tokenFetchPromise;

  tokenFetchPromise = (async () => {
    try {
      const res = await fetch('/api/auth/token', {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      return (data?.accessToken as string) || null;
    } catch {
      return null;
    } finally {
      tokenFetchPromise = null;
    }
  })();

  return tokenFetchPromise;
}

async function getToken(): Promise<string | null> {
  if (cachedToken && !isTokenExpired(cachedToken)) {
    return cachedToken;
  }
  
  cachedToken = null;
  const token = await fetchAccessToken();
  if (token && !isTokenExpired(token)) {
    cachedToken = token;
    return token;
  }
  return null;
}

export function invalidateToken() {
  cachedToken = null;
}

function resolveServiceUrl(endpoint: string): string {
  const formatted = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const cleanPath = formatted.startsWith('/api/v1') ? formatted.replace('/api/v1', '') : formatted;

  if (cleanPath.startsWith('/branches') || cleanPath.startsWith('/clients') || cleanPath.startsWith('/users') || cleanPath.startsWith('/iam')) {
    return `http://127.0.0.1:8081/api/v1${cleanPath}`;
  }
  if (cleanPath.startsWith('/requisitions')) {
    return `http://127.0.0.1:8082/api/v1${cleanPath}`;
  }
  if (cleanPath.startsWith('/candidates')) {
    return `http://127.0.0.1:8083/api/v1${cleanPath}`;
  }
  if (cleanPath.startsWith('/compliance')) {
    return `http://127.0.0.1:8084/api/v1${cleanPath}`;
  }
  if (cleanPath.startsWith('/dashboard') || cleanPath.startsWith('/events')) {
    return `http://127.0.0.1:8085/api/v1${cleanPath}`;
  }
  return `/api/v1${cleanPath}`;
}

export const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  if (typeof window === 'undefined') {
    throw new ApiError(0, { message: 'apiClient called server-side — use server actions instead' });
  }

  let token = await getToken();
  const fullUrl = resolveServiceUrl(endpoint);

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    let response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      invalidateToken();
      const freshToken = await fetchAccessToken();
      if (freshToken) {
        headers.set('Authorization', `Bearer ${freshToken}`);
        response = await fetch(fullUrl, {
          ...options,
          headers,
        });
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(response.status, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const text = await response.text().catch(() => '');
    if (!text || !text.trim()) {
      return {} as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return {} as T;
    }
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, { message: err?.message || 'Network request failed' });
  }
};
