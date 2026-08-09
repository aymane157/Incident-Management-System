export type StoredAuthUser = {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'manager' | 'admin' | 'rt';
  token: string;
  backendRole: string;
  expiresInMs: number;
};

export type StoredAuthSession = {
  user: StoredAuthUser;
};

export const AUTH_STORAGE_KEY = 'incident-management.auth';

export function loadAuthSession(): StoredAuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredAuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveAuthSession(session: StoredAuthSession): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredAuthToken(): string | null {
  return loadAuthSession()?.user.token ?? null;
}
