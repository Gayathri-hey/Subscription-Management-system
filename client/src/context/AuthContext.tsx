import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authStorage } from '@/services/apiClient';
import type { Role, User } from '@/types/api';

export interface AuthContextType {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
  switchRole: (newRole: Role) => void;
}

const DEMO_USERS: Record<Role, User> = {
  ADMIN: {
    id: 'usr_admin_001',
    name: 'Alexander Wright',
    email: 'admin@subscriptions.io',
    role: 'ADMIN',
    status: 'ACTIVE',
    company: 'Enterprise Admin HQ',
  },
  STAFF: {
    id: 'usr_staff_002',
    name: 'Sarah Jenkins',
    email: 'sarah.j@subscriptions.io',
    role: 'STAFF',
    status: 'ACTIVE',
    company: 'Customer Success Team',
  },
  CUSTOMER: {
    id: 'usr_cust_003',
    name: 'David Miller',
    email: 'david@acmecorp.com',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    company: 'Acme Technologies Inc.',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = authStorage.getUser();
    if (saved) return saved;
    // Default to Admin demo user for seamless out-of-the-box development & preview
    return DEMO_USERS.ADMIN;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = (newUser: User, token: string = 'demo_access_token_jwt') => {
    setUser(newUser);
    authStorage.setUser(newUser);
    authStorage.setToken(token);
  };

  const logout = () => {
    setUser(null);
    authStorage.clear();
  };

  const switchRole = (newRole: Role) => {
    const nextUser = DEMO_USERS[newRole];
    setUser(nextUser);
    authStorage.setUser(nextUser);
    authStorage.setToken(`demo_${newRole.toLowerCase()}_token`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

