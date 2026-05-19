import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AdminUser } from '@boutique/shared';
import { fetchAuthMe, loginAdmin, logoutAdmin } from '@boutique/shared';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: AdminUser | null;
  status: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<AuthState>('loading');

  const refresh = useCallback(async () => {
    try {
      const me = await fetchAuthMe();
      setUser(me);
      setStatus(me ? 'authenticated' : 'unauthenticated');
    } catch {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const next = await loginAdmin(email, password);
    setUser(next);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    await logoutAdmin();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({ user, status, login, logout, refresh }),
    [user, status, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
