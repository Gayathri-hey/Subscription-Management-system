import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiClient, authStorage } from '@/services/apiClient';
import type { Role, User } from '@/types/api';

export interface AuthContextType {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token?: string) => void;
  logout: () => Promise<void>;
  switchRole: (newRole: Role) => void;
  refreshUser: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check current session from HTTP-only cookie on application load
  const checkSession = async () => {
    try {
      const response = await apiClient.get<{ user: any; customer?: any }>('/auth/me');
      if (response.data?.user) {
        const u = response.data.user;
        const normalizedRole = (u.role || 'customer').toUpperCase() as Role;
        const mappedUser: User = {
          id: u.id || u._id,
          name: u.name,
          email: u.email,
          role: normalizedRole,
          status: (u.status || 'active').toUpperCase() as any,
          phone: u.phone,
          company: response.data.customer?.companyName || u.company || 'Enterprise Org',
        };
        setUser(mappedUser);
        authStorage.setUser(mappedUser);
      }
    } catch {
      // No active session cookie or session expired
      setUser(null);
      authStorage.clear();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    const handleUnauthorized = () => {
      setUser(null);
      authStorage.clear();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = (newUser: User, token?: string) => {
    setUser(newUser);
    authStorage.setUser(newUser);
    if (token) {
      authStorage.setToken(token);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // continue cleanup even if request fails
    } finally {
      setUser(null);
      authStorage.clear();
    }
  };

  const switchRole = (newRole: Role) => {
    const nextUser = DEMO_USERS[newRole];
    setUser(nextUser);
    authStorage.setUser(nextUser);
  };

  const refreshUser = async () => {
    await checkSession();
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
        refreshUser,
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
