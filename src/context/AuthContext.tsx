import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUsers, addUser, getUser, updateUser as updateUserAPI } from '../utils/api';

export type PublicUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
};

type AuthContextValue = {
  user: PublicUser | null;
  register: (name: string, email: string, password: string, phone: string, address: string) => Promise<PublicUser>;
  login: (email: string, password: string) => Promise<PublicUser>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (updates: Partial<PublicUser>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const CURRENT_KEY = 'ancar_current_user_v1';

// Ensure a seeded admin exists for admin dashboard access.
async function ensureAdminSeeded() {
  try {
    const users = await getUsers();
    const adminEmail = 'admin@ancarmotors.com';
    const exists = users.find((u) => u.user_email.toLowerCase() === adminEmail);
    if (!exists) {
      await addUser({
        user_email: adminEmail,
        user_password: 'adminpass', // hashed later
        user_role: 'admin',
        user_phone_number: '',
        user_address: '',
        user_name: 'Admin',
      });
    }
  } catch {
    console.error('Failed to seed admin');
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PublicUser | null>(() => {
    try {
      const raw = localStorage.getItem(CURRENT_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PublicUser;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // keep localStorage in sync
    if (user) {
      localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_KEY);
    }
  }, [user]);

  useEffect(() => {
    // seed admin account if missing (runs once)
    ensureAdminSeeded();
  }, []);

  const register = async (name: string, email: string, password: string, phone: string, address: string) => {
    const existing = await getUser(email);
    if (existing) {
      throw new Error('An account with that email already exists.');
    }
    const newUser = await addUser({
      user_email: email,
      user_password: password, // TODO: hash password
      user_role: 'user',
      user_phone_number: phone,
      user_address: address,
      user_name: name,
    });
    const publicUser: PublicUser = {
      id: newUser.id,
      name: newUser.user_name || '',
      email: newUser.user_email,
      role: newUser.user_role,
      phone: newUser.user_phone_number,
      address: newUser.user_address,
    };
    setUser(publicUser);
    return publicUser;
  };

  const login = async (email: string, password: string) => {
    const found = await getUser(email);
    if (!found || found.user_password !== password) { // TODO: compare hashed
      throw new Error('Invalid email or password.');
    }
    const publicUser: PublicUser = {
      id: found.id,
      name: found.user_name || '',
      email: found.user_email,
      role: found.user_role,
      phone: found.user_phone_number,
      address: found.user_address,
    };
    setUser(publicUser);
    return publicUser;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = async (updates: Partial<PublicUser>) => {
    if (!user) throw new Error('No user logged in');
    await updateUserAPI(user.id, {
      user_name: updates.name,
      user_email: updates.email,
      user_phone_number: updates.phone,
      user_address: updates.address,
    });
    setUser({ ...user, ...updates });
  };

  const value: AuthContextValue = {
    user,
    register,
    login,
    logout,
    isAuthenticated: Boolean(user),
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

    // eslint-disable-next-line react-refresh/only-export-components
    export function useAuth(): AuthContextValue {
      const ctx = useContext(AuthContext);
      if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return ctx;
    }