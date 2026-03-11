import React, { createContext, useContext, useEffect, useState } from 'react';

    type StoredUser = {
      id: string;
      name: string;
      email: string;
      password: string; // stored locally for demo purposes only
    };

    export type PublicUser = {
      id: string;
      name: string;
      email: string;
    };

    type AuthContextValue = {
      user: PublicUser | null;
      register: (name: string, email: string, password: string) => Promise<PublicUser>;
      login: (email: string, password: string) => Promise<PublicUser>;
      logout: () => void;
      isAuthenticated: boolean;
    };

    const AuthContext = createContext<AuthContextValue | undefined>(undefined);

    const USERS_KEY = 'ancar_users_v1';
    const CURRENT_KEY = 'ancar_current_user_v1';

    function loadUsers(): StoredUser[] {
      try {
        const raw = localStorage.getItem(USERS_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as StoredUser[];
      } catch {
        return [];
      }
    }

    function saveUsers(users: StoredUser[]) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function saveCurrent(user: PublicUser | null) {
      if (user) {
        localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_KEY);
      }
    }

    // Ensure a seeded admin exists for admin dashboard access.
    function ensureAdminSeeded() {
      try {
        const users = loadUsers();
        const adminEmail = 'admin@ancarmotors.com';
        const exists = users.find((u) => u.email.toLowerCase() === adminEmail);
        if (!exists) {
          const id = `admin-${Date.now()}`;
          const adminUser: StoredUser = {
            id,
            name: 'Admin',
            email: adminEmail,
            password: 'adminpass', // seeded password for demo purposes
          };
          users.push(adminUser);
          saveUsers(users);
        }
      } catch {
        // ignore
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
        saveCurrent(user);
      }, [user]);

      useEffect(() => {
        // seed admin account if missing (runs once)
        ensureAdminSeeded();
      }, []);

      const register = async (name: string, email: string, password: string) => {
        const users = loadUsers();
        const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          return Promise.reject(new Error('An account with that email already exists.'));
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const newUser: StoredUser = { id, name, email, password };
        users.push(newUser);
        saveUsers(users);

        const publicUser: PublicUser = { id: newUser.id, name: newUser.name, email: newUser.email };
        setUser(publicUser);
        return Promise.resolve(publicUser);
      };

      const login = async (email: string, password: string) => {
        const users = loadUsers();
        const found = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!found) {
          return Promise.reject(new Error('Invalid email or password.'));
        }
        const publicUser: PublicUser = { id: found.id, name: found.name, email: found.email };
        setUser(publicUser);
        return Promise.resolve(publicUser);
      };

      const logout = () => {
        setUser(null);
        saveCurrent(null);
      };

      const value: AuthContextValue = {
        user,
        register,
        login,
        logout,
        isAuthenticated: Boolean(user),
      };

      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };

    export function useAuth(): AuthContextValue {
      const ctx = useContext(AuthContext);
      if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return ctx;
    }