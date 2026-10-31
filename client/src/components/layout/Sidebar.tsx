import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  UserCheck,
  User,
  Shield,
  Briefcase,
  LogOut,
  X,
  Sparkles,
  Component,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Role } from '@/types/api';
import { ROUTE_PATHS } from '@/types/routes';

interface NavItem {
  title: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', path: ROUTE_PATHS.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { title: 'User Management', path: ROUTE_PATHS.ADMIN_USERS, icon: Users, badge: 'Staff & Clients' },
  { title: 'Product Catalog', path: ROUTE_PATHS.ADMIN_PRODUCTS, icon: Package },
  { title: 'Subscription Plans', path: ROUTE_PATHS.ADMIN_PLANS, icon: Layers },
  { title: 'Financial Reports', path: ROUTE_PATHS.ADMIN_REPORTS, icon: BarChart3 },
  { title: 'System Settings', path: ROUTE_PATHS.ADMIN_SETTINGS, icon: Settings },
];

const STAFF_NAV_ITEMS: NavItem[] = [
  { title: 'Staff Overview', path: ROUTE_PATHS.STAFF_DASHBOARD, icon: LayoutDashboard },
  { title: 'Customers', path: ROUTE_PATHS.STAFF_CUSTOMERS, icon: Users },
  { title: 'Quotations', path: ROUTE_PATHS.STAFF_QUOTATIONS, icon: FileText, badge: 'Quotes' },
  { title: 'Subscriptions', path: ROUTE_PATHS.STAFF_SUBSCRIPTIONS, icon: CreditCard },
];

const CUSTOMER_NAV_ITEMS: NavItem[] = [
  { title: 'Portal Overview', path: ROUTE_PATHS.CUSTOMER_DASHBOARD, icon: LayoutDashboard },
  { title: 'My Subscriptions', path: ROUTE_PATHS.CUSTOMER_SUBSCRIPTIONS, icon: CreditCard },
  { title: 'Invoices & Billing', path: ROUTE_PATHS.CUSTOMER_INVOICES, icon: FileText },
  { title: 'Account Profile', path: ROUTE_PATHS.CUSTOMER_PROFILE, icon: User },
];

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const getRoleIcon = (currentRole: Role | null) => {
  switch (currentRole) {
    case 'ADMIN':
      return Shield;
    case 'STAFF':
      return Briefcase;
    case 'CUSTOMER':
      return UserCheck;
    default:
      return User;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, className }) => {
  const { user, role, logout } = useAuth();
  const location = useLocation();

  const navItems = React.useMemo(() => {
    switch (role) {
      case 'ADMIN':
        return ADMIN_NAV_ITEMS;
      case 'STAFF':
        return STAFF_NAV_ITEMS;
      case 'CUSTOMER':
        return CUSTOMER_NAV_ITEMS;
      default:
        return ADMIN_NAV_ITEMS;
    }
  }, [role]);

  const RoleIcon = getRoleIcon(role);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {/* App Branding */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-md shadow-primary/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-foreground">
                SubScribe<span className="text-primary font-black">Pro</span>
              </span>
              <span className="block text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Subscription Engine
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Active Workspace Role Banner */}
        <div className="px-4 py-3 border-b border-sidebar-border bg-sidebar-accent/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <RoleIcon className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-foreground">
                {role ? `${role} Workspace` : 'Workspace'}
              </span>
            </div>
            <StatusBadge status={role || 'ADMIN'} size="sm" />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const currentPath = location.pathname;
            const isActive =
              currentPath === item.path ||
              (item.path.endsWith('/dashboard') &&
                (currentPath === item.path.replace('/dashboard', '') || currentPath === item.path)) ||
              (!item.path.endsWith('/dashboard') && currentPath.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={cn(
                  'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30 font-semibold'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Component Showcase preview */}
          <div className="pt-4 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
            UI System
          </div>
          <NavLink
            to="/showcase"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className={({ isActive }) =>
              cn(
                'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )
            }
          >
            <div className="flex items-center space-x-3">
              <Component className="h-4 w-4 shrink-0 text-amber-400" />
              <span>Components Showcase</span>
            </div>
            <span className="text-[10px] rounded bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5">
              Task 2
            </span>
          </NavLink>
        </div>

        {/* User Card / Footer */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/10">
          <div className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/60">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary/80 to-purple-600 text-white font-bold text-xs uppercase shadow">
                {user?.name ? user.name.slice(0, 2) : 'US'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  {user?.name || 'Authorized User'}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {user?.company || role}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={logout}
              title="Sign Out"
              className="text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
