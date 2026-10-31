import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Check,
  Shield,
  Briefcase,
  UserCheck,
  ChevronDown,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Role } from '@/types/api';
import { getRouteMetadata, getDefaultDashboardForRole } from '@/types/routes';

export interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user, role, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Compute readable breadcrumb title from RouteMetadata or fallback
  const getBreadcrumbTitle = () => {
    const meta = getRouteMetadata(location.pathname);
    if (meta?.breadcrumb) return meta.breadcrumb;

    const path = location.pathname;
    if (path === '/admin' || path === '/admin/dashboard') return 'Admin Dashboard';
    if (path === '/admin/users') return 'User & Staff Management';
    if (path === '/admin/products') return 'Product & Variant Catalog';
    if (path === '/admin/plans') return 'Subscription Pricing Plans';
    if (path === '/admin/reports') return 'Revenue & Financial Analytics';
    if (path === '/admin/settings') return 'System Configuration';

    if (path === '/staff' || path === '/staff/dashboard') return 'Staff Operations Dashboard';
    if (path === '/staff/customers') return 'Customer Directory';
    if (path === '/staff/quotations') return 'Quotation Generator';
    if (path === '/staff/subscriptions') return 'Customer Subscriptions';

    if (path === '/customer' || path === '/customer/dashboard') return 'Customer Self-Service Portal';
    if (path === '/customer/subscriptions') return 'My Subscriptions & Upgrades';
    if (path === '/customer/invoices') return 'Billing History & Invoices';
    if (path === '/customer/profile') return 'Account Profile & Security';

    if (path === '/showcase') return 'UI Component System & Playground';

    return 'Overview';
  };

  const handleRoleChange = (newRole: Role) => {
    switchRole(newRole);
    setRoleMenuOpen(false);
    navigate(getDefaultDashboardForRole(newRole));
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {getBreadcrumbTitle()}
          </h1>
          <span className="hidden md:inline-flex items-center">
            <span className="mx-2 text-muted-foreground/40">/</span>
            <span className="text-xs text-muted-foreground capitalize">
              {role?.toLowerCase() || 'dashboard'}
            </span>
          </span>
        </div>
      </div>

      {/* Right: Actions, Role Switcher & Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Role Switcher Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center space-x-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15 transition-all shadow-sm"
            aria-expanded={roleMenuOpen}
            aria-haspopup="true"
          >
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Workspace: <strong>{role || 'Select'}</strong></span>
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', roleMenuOpen && 'rotate-180')} />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-2xl backdrop-blur-lg z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-2 border-b border-border/60">
                <p className="text-xs font-semibold text-foreground">Switch Role Persona</p>
                <p className="text-[10px] text-muted-foreground">Test role-guarded permissions live</p>
              </div>

              <div className="py-1.5 space-y-1">
                {(['ADMIN', 'STAFF', 'CUSTOMER'] as Role[]).map((r) => {
                  const isCurrent = role === r;
                  const Icon = r === 'ADMIN' ? Shield : r === 'STAFF' ? Briefcase : UserCheck;

                  return (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors',
                        isCurrent
                          ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="h-4 w-4" />
                        <div className="text-left">
                          <div>{r}</div>
                          <div className={cn('text-[10px]', isCurrent ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                            {r === 'ADMIN' && 'Full system control'}
                            {r === 'STAFF' && 'Quotations & clients'}
                            {r === 'CUSTOMER' && 'Self-service portal'}
                          </div>
                        </div>
                      </div>
                      {isCurrent && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Toggle color theme"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => alert('Notifications: All subscription crons operational.')}
          className="relative rounded-xl border border-border bg-card p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* User Identity Avatar */}
        <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-xs font-bold text-white shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
              {user?.name || 'Session Active'}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {user?.company || role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
