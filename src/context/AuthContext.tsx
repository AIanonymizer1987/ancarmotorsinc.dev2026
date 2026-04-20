import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getUsers, addUser, updateUser as updateUserAPI } from '../utils/api';

export type PublicUser = {
  id: number;
  name: string;
  email: string;
  user_email?: string;
  role: string;
  phone: string;
  address: string;
  user_profile_picture?: string;
  emailVerified?: boolean;
  id_photo_url?: string;
  id_verification_status?: string;
  id_verification_requested_at?: string | null;
  voucher_balance?: number;
  voucher_codes?: string;
};

type AuthContextValue = {
  user: PublicUser | null;
  token: string | null;
  register: (name: string, email: string, password: string, phone: string, address: string) => Promise<PublicUser>;
  login: (email: string, password: string) => Promise<PublicUser>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (updates: Partial<PublicUser>) => Promise<void>;
  refreshToken: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

type AuthState = {
  user: PublicUser | null;
  token: string | null;
  expiresAt: number | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const CURRENT_KEY = 'ancar_auth_state_v1';

const loadAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, expiresAt: null };
  }

  try {
    const raw = window.localStorage.getItem(CURRENT_KEY);
    if (!raw) return { user: null, token: null, expiresAt: null };
    return JSON.parse(raw) as AuthState;
  } catch {
    return { user: null, token: null, expiresAt: null };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(loadAuthState);

  useEffect(() => {
    if (authState.user && authState.token && authState.expiresAt) {
      window.localStorage.setItem(CURRENT_KEY, JSON.stringify(authState));
    } else {
      window.localStorage.removeItem(CURRENT_KEY);
    }
  }, [authState]);

  useEffect(() => {
    if (!authState.token || !authState.expiresAt) return;

    if (Date.now() >= authState.expiresAt) {
      setAuthState({ user: null, token: null, expiresAt: null });
      return;
    }

    const timeout = window.setTimeout(() => {
      setAuthState({ user: null, token: null, expiresAt: null });
    }, authState.expiresAt - Date.now());

    return () => window.clearTimeout(timeout);
  }, [authState.token, authState.expiresAt]);

  useEffect(() => {
    const handleActivity = () => {
      if (!authState.token || !authState.expiresAt) return;
      const remaining = authState.expiresAt - Date.now();
      if (remaining < 20 * 60 * 1000) {
        refreshToken();
      }
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('mousemove', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('mousemove', handleActivity);
    };
  }, [authState.token, authState.expiresAt]);

  const setAuthStateWithToken = (user: PublicUser, token: string, expiresAt: number) => {
    setAuthState({ user, token, expiresAt });
  };

  const refreshToken = async () => {
    if (!authState.token) return;
    try {
      const response = await fetch('/api/auth?action=refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.token || !data.expiresAt) {
        setAuthState({ user: null, token: null, expiresAt: null });
        return;
      }
      setAuthState((prev) => ({ ...prev, token: data.token, expiresAt: data.expiresAt }));
    } catch {
      setAuthState({ user: null, token: null, expiresAt: null });
    }
  };

  const refreshUser = useCallback(async () => {
    const userEmail = authState.user?.email;
    if (!userEmail) return;
    try {
      const response = await fetch(`/api/neon/users?user_email=eq.${encodeURIComponent(userEmail)}&select=*`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) return;
      const data = await response.json();
      const refreshed = data[0];
      if (!refreshed) return;
      setAuthState((prev) => {
        if (!prev.user) return prev;
        return {
          ...prev,
          user: {
            ...prev.user,
            emailVerified: refreshed.user_email_verified || false,
            user_profile_picture: refreshed.user_profile_picture || prev.user.user_profile_picture,
            id_photo_url: refreshed.id_photo_url || prev.user.id_photo_url,
            id_verification_status: refreshed.id_verification_status || prev.user.id_verification_status,
            id_verification_requested_at:
              refreshed.id_verification_requested_at || prev.user.id_verification_requested_at,
            voucher_balance: Number(refreshed.voucher_balance || 0),
            voucher_codes: refreshed.voucher_codes || prev.user.voucher_codes,
          },
        };
      });
    } catch {
      // ignore refresh errors
    }
  }, [authState.user?.email]);

  const register = async (name: string, email: string, password: string, phone: string, address: string) => {
    const response = await fetch('/api/auth?action=register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, address }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || data.detail || 'Failed to register.');
    }

    if (!data.user || !data.token || !data.expiresAt) {
      throw new Error('Registration returned invalid authentication data.');
    }

    setAuthStateWithToken(data.user, data.token, data.expiresAt);
    return data.user as PublicUser;
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || data.detail || `Login failed (${response.status})`);
    }

    if (!data.user || !data.token || !data.expiresAt) {
      throw new Error('Login returned invalid authentication data.');
    }

    setAuthStateWithToken(data.user, data.token, data.expiresAt);
    return data.user as PublicUser;
  };

  const logout = () => {
    setAuthState({ user: null, token: null, expiresAt: null });
  };

  const updateUser = async (updates: Partial<PublicUser>) => {
    if (!authState.user) throw new Error('No user logged in');
    await updateUserAPI(authState.user.id, {
      user_name: updates.name,
      user_email: updates.email,
      user_phone_number: updates.phone,
      user_address: updates.address,
    });
    setAuthState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  };

  const value: AuthContextValue = {
    user: authState.user,
    token: authState.token,
    register,
    login,
    logout,
    isAuthenticated:
      Boolean(authState.user && authState.token && authState.expiresAt && authState.expiresAt > Date.now()),
    updateUser,
    refreshToken,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};