import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUsers, addUser, getUser, getEmployee, updateUser as updateUserAPI } from '../utils/api';

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
    const existingUser = await getUser(email);
    const existingEmployee = await getEmployee(email);

    if (existingEmployee) {
      throw new Error('An account with that email already exists as an employee. Please use your employee credentials.');
    }

    const userPayload = {
      user_email: email,
      user_password: password, // TODO: hash password
      user_role: 'user',
      user_phone_number: phone,
      user_address: address,
      user_name: name,
    };

    if (existingUser) {
      await updateUserAPI(existingUser.id, userPayload);
    }

    const publicUser: PublicUser = {
      id: existingUser ? existingUser.id : (await addUser(userPayload)).id,
      name: userPayload.user_name,
      email: userPayload.user_email,
      role: userPayload.user_role,
      phone: userPayload.user_phone_number,
      address: userPayload.user_address,
    };

    setUser(publicUser);
    return publicUser;
  };

  const login = async (email: string, password: string) => {
    const foundUser = await getUser(email);
    let account: any = foundUser;
    let isEmployee = false;

    if (!account) {
      const employee = await getEmployee(email);
      if (employee) {
        account = employee;
        isEmployee = true;
      }
    }

    if (!account) {
      throw new Error('Invalid email or password.');
    }

    const accountPassword = account.user_password || account.password;
    if (accountPassword !== password) {
      throw new Error('Invalid email or password.');
    }

    const publicUser: PublicUser = {
      id: account.id,
      name: account.user_name || account.employee_name || '',
      email: account.user_email || account.email,
      role: account.user_role || (account.admin_role ? 'admin' : isEmployee ? 'employee' : 'user'),
      phone: account.user_phone_number || account.phone_number || '',
      address: account.user_address || account.address || '',
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