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

export interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user, role, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Compute readable breadcrumb title
  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Admin Dashboard';
    if (path === '/admin/users') return 'User & Staff Management';
    if (path === '/admin/products') return 'Product & Variant Catalog';
    if (path === '/admin/plans') return 'Subscription Pricing Plans';
    if (path === '/admin/reports') return 'Revenue & Financial Analytics';
    if (path === '/admin/settings') return 'System Configuration';

    if (path === '/staff') return 'Staff Operations Dashboard';
    if (path === '/staff/customers') return 'Customer Directory';
    if (path === '/staff/quotations') return 'Quotation Generator';
    if (path === '/staff/subscriptions') return 'Customer Subscriptions';

    if (path === '/customer') return 'Customer Self-Service Portal';
    if (path === '/customer/subscriptions') return 'My Subscriptions & Upgrades';
    if (path === '/customer/invoices') return 'Billing History & Invoices';
    if (path === '/customer/profile') return 'Account Profile & Security';

    if (path === '/showcase') return 'UI Component System & Playground';

    return 'Overview';
  };

  const handleRoleChange = (newRole: Role) => {
    switchRole(newRole);
    setRoleMenuOpen(false);
    if (newRole === 'ADMIN') navigate('/admin');
    if (newRole === 'STAFF') navigate('/staff');
    if (newRole === 'CUSTOMER') navigate('/customer');
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
            className="flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm hover:bg-accent hover:border-primary/40 transition-all focus:outline-none focus:ring-2 focus:ring-ring"
            title="Switch Simulated Role"
          >
            <span className="text-muted-foreground hidden sm:inline">Role:</span>
            <span className="text-primary font-bold">{role}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {roleMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setRoleMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 z-50 w-56 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border mb-1">
                  Switch Active Role
                </div>
                {(['ADMIN', 'STAFF', 'CUSTOMER'] as Role[]).map((r) => {
                  const isSelected = role === r;
                  const Icon =
                    r === 'ADMIN' ? Shield : r === 'STAFF' ? Briefcase : UserCheck;

                  return (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                        isSelected
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-foreground hover:bg-accent'
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{r} Workspace</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="text-muted-foreground hover:text-foreground"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          </Button>
        </div>

        {/* Profile Avatar Pill */}
        <div className="flex items-center space-x-2 pl-1 border-l border-border/80">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-indigo-500 text-white font-bold text-xs uppercase shadow-sm">
            {user?.name ? user.name.slice(0, 2) : 'US'}
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>
          <span className="hidden xl:inline text-xs font-semibold text-foreground max-w-[120px] truncate">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

