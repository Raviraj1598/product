import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CustomerUser } from '@boutique/shared';
import {
  fetchCustomerMe,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  updateCustomerProfile,
} from '@boutique/shared';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

interface CustomerAuthContextValue {
  user: CustomerUser | null;
  status: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    addressLine1?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (patch: Partial<Omit<CustomerUser, 'id' | 'email'>>) => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [status, setStatus] = useState<AuthState>('loading');

  const refresh = useCallback(async () => {
    try {
      const me = await fetchCustomerMe();
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
    const next = await loginCustomer(email, password);
    setUser(next);
    setStatus('authenticated');
  }, []);

  const register = useCallback(
    async (payload: {
      email: string;
      password: string;
      name: string;
      phone?: string;
      addressLine1?: string;
      city?: string;
      zipCode?: string;
      country?: string;
    }) => {
      const next = await registerCustomer(payload);
      setUser(next);
      setStatus('authenticated');
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutCustomer();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const updateProfile = useCallback(async (patch: Partial<Omit<CustomerUser, 'id' | 'email'>>) => {
    const next = await updateCustomerProfile(patch);
    setUser(next);
  }, []);

  const value = useMemo(
    () => ({ user, status, login, register, logout, refresh, updateProfile }),
    [user, status, login, register, logout, refresh, updateProfile],
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
