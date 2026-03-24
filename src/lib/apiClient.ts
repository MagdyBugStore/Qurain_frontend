// eslint-disable-next-line @typescript-eslint/no-explicit-any
const viteEnv: any = (import.meta as any).env || {};
const API_BASE_URL = viteEnv.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

let token: string | null = null;

export function setToken(newToken: string | null) {
  token = newToken;

  if (newToken) {
    localStorage.setItem('auth_token', newToken);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function loadTokenFromStorage(): string | null {
  const stored = localStorage.getItem('auth_token');
  token = stored || null;
  return token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const baseHeaders: Record<string, string> = isFormData
    ? {}
    : { 'Content-Type': 'application/json' };

  const extraHeaders = options.headers as Record<string, string> | undefined;
  const headers: Record<string, string> = extraHeaders
    ? { ...baseHeaders, ...extraHeaders }
    : baseHeaders;

  // Ensure token is loaded from storage if not already set
  if (!token) {
    token = loadTokenFromStorage();
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isDev = (import.meta as any).env?.DEV || (import.meta as any).env?.MODE === 'development';
    if (isDev) {
      console.warn('API request without token:', path);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || !json || json.success !== true) {
    // Enhanced error logging for 403/401 errors
    if (response.status === 403 || response.status === 401) {
      console.error('Auth error:', {
        path,
        status: response.status,
        error: json?.error,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
      });
    }
    
    const message =
      json?.error?.message || json?.message || response.statusText || 'Request failed';
    throw new Error(message);
  }

  return json.data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  postFormData: <T>(path: string, formData: FormData) =>
    request<T>(path, {
      method: 'POST',
      body: formData,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) =>
    request<T>(path, {
      method: 'DELETE',
    }),
};

