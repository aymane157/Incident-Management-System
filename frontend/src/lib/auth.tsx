import { createContext, useContext, useState, type ReactNode } from 'react';
import { API_BASE_URL } from './api';
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
  type StoredAuthUser,
} from './session';

export type UserRole = 'client' | 'manager' | 'admin' | 'rt';

export type AuthUser = StoredAuthUser;

export type LoginCredentials = {
  email: string;
  password: string;
};

interface AuthContextValue {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => void;
}

type LoginResponse = {
  userId: number;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  token: string;
  expiresInMs: number;
  role?: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeRole(role?: string | null): UserRole {
  switch (role) {
    case 'ADMIN':
      return 'admin';
    case 'CLIENT':
      return 'client';
    case 'INCIDENT_MANAGER':
      return 'manager';
    case 'MEMBRE_EQUIPE':
    case 'RESPONSABLE_TRAITEMENT':
      return 'rt';
    default:
      return 'client';
  }
}

function buildUser(response: LoginResponse): AuthUser {
  const name = [response.firstName, response.lastName].filter(Boolean).join(' ') || response.username || 'Utilisateur';

  return {
    id: response.userId,
    name,
    email: response.username ?? '',
    role: normalizeRole(response.role),
    token: response.token,
    backendRole: response.role ?? 'CLIENT',
    expiresInMs: response.expiresInMs,
  };
}

async function parseError(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const payload = await response.json().catch(() => null);
    if (payload && typeof payload === 'object') {
      if (typeof payload.message === 'string') return payload.message;
      if (typeof payload.error === 'string') return payload.error;
      if (typeof payload.detail === 'string') return payload.detail;
    }
  }

  const text = await response.text().catch(() => '');
  return text.trim() || `Request failed with status ${response.status}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadAuthSession()?.user ?? null);

  const login = async (credentials: LoginCredentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    const payload = (await response.json()) as LoginResponse;
    const nextUser = buildUser(payload);
    setUser(nextUser);
    saveAuthSession({ user: nextUser });
    return nextUser;
  };

  const logout = () => {
    setUser(null);
    clearAuthSession();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
