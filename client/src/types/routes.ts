import type { Role } from './roles';

export interface RouteMetadata {
  id: string;
  path: string;
  title: string;
  breadcrumb: string;
  description: string;
  allowedRoles?: Role[]; // If empty or undefined, route is public or accessible to all authenticated users
  isPublic?: boolean;
  requiresAuth?: boolean;
  layout: 'auth' | 'dashboard' | 'blank';
  showInNav?: boolean;
  navCategory?: 'admin' | 'staff' | 'customer' | 'auth' | 'public';
  iconName?: string;
  badge?: string;
}

export const ROUTE_PATHS = {
  // Public Auth Routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Admin Workspace
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_STAFF: '/admin/staff',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PLANS: '/admin/plans',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SETTINGS: '/admin/settings',

  // Staff Workspace
  STAFF_DASHBOARD: '/staff/dashboard',
  STAFF_CUSTOMERS: '/staff/customers',
  STAFF_QUOTATIONS: '/staff/quotations',
  STAFF_SUBSCRIPTIONS: '/staff/subscriptions',

  // Customer Portal
  CUSTOMER_DASHBOARD: '/customer/dashboard',
  CUSTOMER_SUBSCRIPTIONS: '/customer/subscriptions',
  CUSTOMER_INVOICES: '/customer/invoices',
  CUSTOMER_PROFILE: '/customer/profile',

  // Developer Showcase
  SHOWCASE: '/showcase',
} as const;

export const APP_ROUTES: Record<string, RouteMetadata> = {
  // ─── Public Authentication ───────────────────────────────────────────────────
  LOGIN: {
    id: 'auth-login',
    path: ROUTE_PATHS.LOGIN,
    title: 'Sign In',
    breadcrumb: 'Sign In',
    description: 'Sign in to access your administrative, staff, or customer workspace.',
    isPublic: true,
    requiresAuth: false,
    layout: 'auth',
    navCategory: 'auth',
  },
  REGISTER: {
    id: 'auth-register',
    path: ROUTE_PATHS.REGISTER,
    title: 'Create an Account',
    breadcrumb: 'Register',
    description: 'Create a new customer account to subscribe and manage recurring plans.',
    isPublic: true,
    requiresAuth: false,
    layout: 'auth',
    navCategory: 'auth',
  },
  FORGOT_PASSWORD: {
    id: 'auth-forgot-password',
    path: ROUTE_PATHS.FORGOT_PASSWORD,
    title: 'Forgot Password',
    breadcrumb: 'Forgot Password',
    description: 'Request a secure password reset email link.',
    isPublic: true,
    requiresAuth: false,
    layout: 'auth',
    navCategory: 'auth',
  },
  RESET_PASSWORD: {
    id: 'auth-reset-password',
    path: ROUTE_PATHS.RESET_PASSWORD,
    title: 'Reset Password',
    breadcrumb: 'Reset Password',
    description: 'Update account password with verification token.',
    isPublic: true,
    requiresAuth: false,
    layout: 'auth',
    navCategory: 'auth',
  },

  // ─── Admin Workspace ────────────────────────────────────────────────────────
  ADMIN_DASHBOARD: {
    id: 'admin-dashboard',
    path: ROUTE_PATHS.ADMIN_DASHBOARD,
    title: 'Admin Executive Dashboard',
    breadcrumb: 'Admin Dashboard',
    description: 'System overview, MRR metrics, customer health, and recent subscriptions.',
    allowedRoles: ['ADMIN'],
    isPublic: false,
    requiresAuth: true,
    layout: 'dashboard',
    showInNav: true,
    navCategory: 'admin',
    iconName: 'LayoutDashboard',
  },
  ADMIN_STAFF: {
    id: 'admin-staff',
    path: ROUTE_PATHS.ADMIN_STAFF,
    title: 'Staff Management',
    breadcrumb: 'Staff Management',
    description: 'Create, monitor, and configure operational staff team members.',
    allowedRoles: ['ADMIN'],
    isPublic: false,
    requiresAuth: true,
    layout: 'dashboard',
    showInNav: true,
    navCategory: 'admin',
    iconName: 'Users',
    badge: 'Operations',
  },
  ADMIN_USERS: {
    id: 'admin-users',
    path: ROUTE_PATHS.ADMIN_USERS,
    title: 'User & Staff Directory',
    breadcrumb: 'Users & Staff',
    description: 'Provision staff members, manage user roles, and review account statuses.',
    allowedRoles: ['ADMIN'],
    isPublic: false,
    requiresAuth: true,
    layout: 'dashboard',
    showInNav: true,
    navCategory: 'admin',
    iconName: 'Users',
    badge: 'Staff & Clients',
  },
  ADMIN_PRODUCTS: {
    id: 'admin-products',
    path: ROUTE_PATHS.ADMIN_PRODUCTS,
    title: 'Product Catalog Management',
    breadcrumb: 'Products',
    description: 'Configure software products, modules, and billing variants.',
    allowedRoles: ['ADMIN'],
    isPublic: false,
    requiresAuth: true,
    layout: 'dashboard',
    showInNav: true,
    navCategory: 'admin',
    iconName: 'Package',
  },
  ADMIN_PLANS: {
    id: 'admin-plans',
    path: ROUTE_PATHS.ADMIN_PLANS,
    title: 'Subscription Pricing Plans',
    breadcrumb: 'Plans',
    description: 'Define pricing tiers, intervals, trials, and bundled products.',
    allowedRoles: ['ADMIN'],
    isPublic: false,
    requiresAuth: true,
    layout: 'dashboard',
    showInNav: true,
    navCategory: 'admin',
    iconName: 'Layers',
  },
  ADMIN_REPORTS: {
    id: 'admin-reports',
    path: ROUTE_PATHS.ADMIN_REPORTS,
    title: 'Financial & Revenue Analytics',
    breadcrumb: 'Financial Reports',
    description: 'Revenue growth, churn rate, invoice collection summaries, and tax telemetry.',
    allowedRoles: ['ADMIN'],
    isPublic: false,
    requiresAuth: true,
    layout: 'dashboard',
    showInNav: true,
    navCategory: 'admin',
    iconName: 'BarChart3',
  },
  ADMIN_SETTINGS: {
    id: 'admin-settings',
    path: ROUTE_PATHS.ADMIN_SETTINGS,
    title: 'System & Security Settings',
    breadcrumb: 'Settings',
    description: 'Audit logs, tax rules, currency configuration, and payment gateway options.',
    allowedRoles: ['ADMIN'],
    isPublic: false,
    requiresAuth: true,
    layout: 'dashboard',
    showInNav: true,
    navCategory: 'admin',
    iconName: 'Settings',
  },

  // ─── Staff Workspace ────────────────────────────────────────────────────────
  STAFF_DASHBOARD: {
    id: 'staff-dashboard',
    path: ROUTE_PATHS.STAFF_DASHBOARD,
    title: 'Staff Operations Dashboard',
    breadcrumb: 'Staff Overview',
    description: 'Operational overview of pending customer quotations and active accounts.',
    allowedRoles: ['ADMIN', 'STAFF'],
    isPublic: false,
    requiresAuth: true,
    layout: 'dashboard',
    showInNav: true,
    navCategory: 'staff',
    iconName: 'LayoutDashboard',
  },
  STAFF_CUSTOMERS: {
    id: 'staff-customers',
    path: ROUTE_PATHS.STAFF_CUSTOMERS,
    title: 'Customer Directory',
    breadcrumb: 'Customers',
    description: 'Browse client portfolios, billing addresses, and credit statuses.',
    allowedRoles: ['ADMIN', 'STAFF'],
    isPublic: false,
    requiresAuth: true,
    layout: 'dashboard',
    showInNav: true,
    navCategory: 'staff',
    iconName: 'Users',
  },
  STAFF_QUOTATIONS: {
    id: 'staff-quotations',
    path: ROUTE_PATHS.STAFF_QUOTATIONS,
    title: 'Sales Quotation Generator',
    breadcrumb: 'Quotations',
    description: 'Generate customized price quotes from templates with volume discounts.',
    allowedRoles: ['ADMIN', 'STAFF'],
    isPublic: false,
    requiresAuth: true,
    layout: 'dashboard',
    showInNav: true,
    navCategory: 'staff',
    iconName: 'FileText',
    badge: 'Quotes',
  },
  STAFF_SUBSCRIPTIONS: {
    id: 'staff-subscriptions',
    path: ROUTE_PATHS.STAFF_SUBSCRIPTIONS,
    title: 'Customer Subscriptions',
    breadcrumb: 'Subscriptions',
    description: 'Monitor renewals, handle pause/cancellation requests, and apply coupons.',
    allowedRoles: ['ADMIN', 'STAFF'],
    isPublic: false,
    requiresAuth: true,
    layout: 'dashboard',
    showInNav: true,
    navCategory: 'staff',
    iconName: 'CreditCard',
  },

  // ─── Customer Self-Service Portal ───────────────────────────────────────────
  CUSTOMER_DASHBOARD: {
    id: 'customer-dashboard',
    path: ROUTE_PATHS.CUSTOMER_DASHBOARD,
    title: 'Customer Self-Service Portal',
    breadcrumb: 'Portal Overview',
    description: 'View active plans, next renewal dates, and recent payment receipts.',
    allowedRoles: ['ADMIN', 'CUSTOMER'],
    isPublic: false,
    requiresAuth: true,
    layout: 'dashboard',
    showInNav: true,
    navCategory: 'customer',
    iconName: 'LayoutDashboard',
  },
  CUSTOMER_SUBSCRIPTIONS: {
    id: 'customer-subscriptions',
    path: ROUTE_PATHS.CUSTOMER_SUBSCRIPTIONS,
    title: 'My Subscriptions & Upgrades',
    breadcrumb: 'Subscriptions',
    description: 'Review subscribed plans, upgrade tiers, or update renewal preferences.',
    allowedRoles: ['ADMIN', 'CUSTOMER'],
    isPublic: false,
    requiresAuth: true,
    layout: 'dashboard',
    showInNav: true,
    navCategory: 'customer',
    iconName: 'CreditCard',
  },
  CUSTOMER_INVOICES: {
    id: 'customer-invoices',
    path: ROUTE_PATHS.CUSTOMER_INVOICES,
    title: 'Invoices & Billing History',
    breadcrumb: 'Invoices',
    description: 'Download PDF invoices, view line-item taxes, and verify settlement records.',
    allowedRoles: ['ADMIN', 'CUSTOMER'],
    isPublic: false,
    requiresAuth: true,
    layout: 'dashboard',
    showInNav: true,
    navCategory: 'customer',
    iconName: 'FileText',
  },
  CUSTOMER_PROFILE: {
    id: 'customer-profile',
    path: ROUTE_PATHS.CUSTOMER_PROFILE,
    title: 'Account Profile & Security',
    breadcrumb: 'Profile',
    description: 'Update company information, billing address, and contact details.',
    allowedRoles: ['ADMIN', 'CUSTOMER'],
    isPublic: false,
    requiresAuth: true,
    layout: 'dashboard',
    showInNav: true,
    navCategory: 'customer',
    iconName: 'User',
  },

  // ─── Showcase ───────────────────────────────────────────────────────────────
  SHOWCASE: {
    id: 'showcase',
    path: ROUTE_PATHS.SHOWCASE,
    title: 'Component Library & Showcase',
    breadcrumb: 'UI Showcase',
    description: 'Interactive playground demonstrating atomic UI components and tokens.',
    isPublic: true,
    layout: 'dashboard',
    showInNav: false,
  },
};

/**
 * Finds metadata for a specific route path.
 */
export const getRouteMetadata = (pathname: string): RouteMetadata | undefined => {
  const normalized = pathname.toLowerCase().replace(/\/$/, '') || '/';
  return Object.values(APP_ROUTES).find((route) => {
    const routePath = route.path.toLowerCase().replace(/\/$/, '') || '/';
    return routePath === normalized;
  });
};

/**
 * Checks whether a given role is authorized to view a specific path.
 */
export const isRouteAllowed = (pathname: string, userRole: Role | null): boolean => {
  const metadata = getRouteMetadata(pathname);
  if (!metadata) return true; // Let 404 handler capture unknown routes
  if (metadata.isPublic) return true;
  if (!userRole) return false;
  if (!metadata.allowedRoles || metadata.allowedRoles.length === 0) return true;
  return metadata.allowedRoles.includes(userRole);
};

/**
 * Returns the default initial dashboard route for a given role.
 */
export const getDefaultDashboardForRole = (role: Role): string => {
  switch (role) {
    case 'ADMIN':
      return ROUTE_PATHS.ADMIN_DASHBOARD;
    case 'STAFF':
      return ROUTE_PATHS.STAFF_DASHBOARD;
    case 'CUSTOMER':
      return ROUTE_PATHS.CUSTOMER_DASHBOARD;
    default:
      return ROUTE_PATHS.LOGIN;
  }
};

