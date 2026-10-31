/**
 * Shared Role Types and Capability Definitions
 * Defines the enterprise role-based access control (RBAC) structure.
 */

export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export type UserRole = 'admin' | 'staff' | 'customer';

export type Permission =
  | 'MANAGE_USERS'
  | 'MANAGE_STAFF'
  | 'MANAGE_PRODUCTS'
  | 'MANAGE_PLANS'
  | 'MANAGE_TAXES'
  | 'MANAGE_DISCOUNTS'
  | 'CREATE_QUOTATIONS'
  | 'APPROVE_QUOTATIONS'
  | 'VIEW_ALL_SUBSCRIPTIONS'
  | 'MANAGE_SUBSCRIPTIONS'
  | 'VIEW_OWN_SUBSCRIPTIONS'
  | 'VIEW_ALL_INVOICES'
  | 'MANAGE_INVOICES'
  | 'VIEW_OWN_INVOICES'
  | 'VIEW_REVENUE_ANALYTICS'
  | 'MANAGE_SETTINGS'
  | 'ACCESS_CUSTOMER_PORTAL';

export interface RoleConfig {
  role: Role;
  label: string;
  shortLabel: string;
  description: string;
  defaultPath: string;
  badgeVariant: 'default' | 'success' | 'warning' | 'info';
  permissions: Permission[];
}

export const ROLE_CONFIGS: Record<Role, RoleConfig> = {
  ADMIN: {
    role: 'ADMIN',
    label: 'System Administrator',
    shortLabel: 'Admin',
    description: 'Full executive control over platform settings, catalogs, staff, and financial analytics.',
    defaultPath: '/admin/dashboard',
    badgeVariant: 'default',
    permissions: [
      'MANAGE_USERS',
      'MANAGE_STAFF',
      'MANAGE_PRODUCTS',
      'MANAGE_PLANS',
      'MANAGE_TAXES',
      'MANAGE_DISCOUNTS',
      'CREATE_QUOTATIONS',
      'APPROVE_QUOTATIONS',
      'VIEW_ALL_SUBSCRIPTIONS',
      'MANAGE_SUBSCRIPTIONS',
      'VIEW_ALL_INVOICES',
      'MANAGE_INVOICES',
      'VIEW_REVENUE_ANALYTICS',
      'MANAGE_SETTINGS',
    ],
  },
  STAFF: {
    role: 'STAFF',
    label: 'Operations & Sales Staff',
    shortLabel: 'Staff',
    description: 'Day-to-day operations handling customer queries, drafting quotations, and monitoring subscriptions.',
    defaultPath: '/staff/dashboard',
    badgeVariant: 'info',
    permissions: [
      'MANAGE_PRODUCTS',
      'MANAGE_PLANS',
      'CREATE_QUOTATIONS',
      'VIEW_ALL_SUBSCRIPTIONS',
      'VIEW_ALL_INVOICES',
    ],
  },
  CUSTOMER: {
    role: 'CUSTOMER',
    label: 'Customer Account',
    shortLabel: 'Customer',
    description: 'Self-service customer portal to manage personal subscriptions, download invoices, and update billing.',
    defaultPath: '/customer/dashboard',
    badgeVariant: 'success',
    permissions: [
      'VIEW_OWN_SUBSCRIPTIONS',
      'VIEW_OWN_INVOICES',
      'ACCESS_CUSTOMER_PORTAL',
    ],
  },
};

/**
 * Checks whether a role possesses a specific permission.
 */
export const hasPermission = (role: Role | null | undefined, permission: Permission): boolean => {
  if (!role) return false;
  const config = ROLE_CONFIGS[role];
  return config ? config.permissions.includes(permission) : false;
};

/**
 * Normalizes role string to canonical Role enum (case-insensitive).
 */
export const normalizeRole = (role: string | null | undefined): Role => {
  if (!role) return 'CUSTOMER';
  const upper = role.toUpperCase();
  if (upper === 'ADMIN') return 'ADMIN';
  if (upper === 'STAFF') return 'STAFF';
  return 'CUSTOMER';
};

/**
 * Type guard for Role.
 */
export const isRole = (val: unknown): val is Role => {
  return typeof val === 'string' && ['ADMIN', 'STAFF', 'CUSTOMER'].includes(val.toUpperCase());
};

