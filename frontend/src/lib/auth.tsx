import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchUserById, login as loginRequest, setAuthToken, clearAuthToken, type UserDto } from './api';

export type UserRole = 'client' | 'manager' | 'admin' | 'rt';

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  teamId?: number | null;
  teamName?: string | null;
  teamFunctionRole?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (credentials: { email: string; password: string }) => Promise<AuthUser>;
  logout: () => void;
}

const STORAGE_KEY = 'incident-management-auth';

const ROLE_MAP: Record<string, UserRole> = {
  ADMIN: 'admin',
  CLIENT: 'client',
  INCIDENT_MANAGER: 'manager',
  MEMBRE_EQUIPE: 'rt',
  RESPONSABLE_TRAITEMENT: 'rt',
};

function mapRole(role?: string | null): UserRole {
  return (role && ROLE_MAP[role]) || 'client';
}

function buildAuthUser(loginData: Awaited<ReturnType<typeof loginRequest>>, profile: UserDto): AuthUser {
  const firstName = profile.firstName ?? loginData.firstName ?? '';
  const lastName = profile.lastName ?? loginData.lastName ?? '';
  const name = [firstName, lastName].filter(Boolean).join(' ') || loginData.username;

  return {
    id: loginData.userId,
    firstName,
    lastName,
    name,
    email: profile.email ?? loginData.username,
    role: mapRole(loginData.role),
    token: loginData.token,
    teamId: profile.teamId ?? null,
    teamName: profile.teamName ?? null,
    teamFunctionRole: profile.teamFunctionRole ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored) as AuthUser;
      if (parsed.token) {
        setAuthToken(parsed.token);
        return parsed;
      }
    } catch {
      // ignore invalid stored auth state
    }

    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setAuthToken(user.token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      clearAuthToken();
    }
  }, [user]);

  const login = async (credentials: { email: string; password: string }) => {
    const auth = await loginRequest(credentials);
    setAuthToken(auth.token);
    const profile = await fetchUserById(auth.userId);
    const nextUser = buildAuthUser(auth, profile);
    setUser(nextUser);
    return nextUser;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
