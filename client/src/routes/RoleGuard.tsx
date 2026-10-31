import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Role } from '@/types/api';

interface RoleGuardProps {
  allowedRoles?: Role[];
  children?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-foreground">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs text-muted-foreground">Verifying credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4 border border-rose-500/20">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
          Your current account role (<strong className="text-foreground">{role}</strong>) does not have authorization to view this section.
        </p>
        <Button
          onClick={() => {
            if (role === 'ADMIN') window.location.href = '/admin';
            else if (role === 'STAFF') window.location.href = '/staff';
            else window.location.href = '/customer';
          }}
        >
          Return to My Workspace
        </Button>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RoleGuard;

