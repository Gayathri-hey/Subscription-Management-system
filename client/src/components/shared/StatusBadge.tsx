import React from 'react';
import { Badge, type badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { capitalize } from '@/lib/utils';

export type EntityStatus =
  // Subscriptions
  | 'ACTIVE'
  | 'PENDING'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'TRIALING'
  | 'PAUSED'
  // Quotations
  | 'DRAFT'
  | 'SENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONVERTED'
  // Invoices & Payments
  | 'PAID'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'FAILED'
  | 'PROCESSING'
  // Users & General
  | 'SUSPENDED'
  | 'INACTIVE'
  | 'ADMIN'
  | 'STAFF'
  | 'CUSTOMER'
  | string;

interface StatusConfig {
  label: string;
  variant: NonNullable<VariantProps<typeof badgeVariants>['variant']>;
  dot?: boolean;
  pulse?: boolean;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  // Positive / Active
  ACTIVE: { label: 'Active', variant: 'success', dot: true, pulse: true },
  PAID: { label: 'Paid', variant: 'success', dot: true },
  APPROVED: { label: 'Approved', variant: 'success', dot: true },
  CONVERTED: { label: 'Converted', variant: 'success' },

  // In-progress / Neutral
  TRIALING: { label: 'Trialing', variant: 'info', dot: true, pulse: true },
  PROCESSING: { label: 'Processing', variant: 'info', dot: true, pulse: true },
  SENT: { label: 'Sent', variant: 'info', dot: true },
  PENDING: { label: 'Pending', variant: 'warning', dot: true },
  PAUSED: { label: 'Paused', variant: 'warning', dot: true },

  // Draft / Inactive
  DRAFT: { label: 'Draft', variant: 'outline', dot: false },
  INACTIVE: { label: 'Inactive', variant: 'secondary', dot: false },

  // Negative / Danger
  EXPIRED: { label: 'Expired', variant: 'destructive', dot: true },
  CANCELLED: { label: 'Cancelled', variant: 'destructive', dot: false },
  OVERDUE: { label: 'Overdue', variant: 'destructive', dot: true, pulse: true },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  FAILED: { label: 'Failed', variant: 'destructive', dot: true },
  SUSPENDED: { label: 'Suspended', variant: 'destructive', dot: true },

  // Roles
  ADMIN: { label: 'Admin', variant: 'purple', dot: false },
  STAFF: { label: 'Staff', variant: 'info', dot: false },
  CUSTOMER: { label: 'Customer', variant: 'outline', dot: false },
};

export interface StatusBadgeProps {
  status: EntityStatus;
  label?: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'default',
  className,
  showDot,
}) => {
  const normalizedKey = (status || '').toUpperCase();
  const config = STATUS_CONFIGS[normalizedKey] || {
    label: label || capitalize(status),
    variant: 'secondary',
    dot: false,
    pulse: false,
  };

  const displayLabel = label || config.label;
  const renderDot = showDot !== undefined ? showDot : config.dot;

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={renderDot}
      pulse={config.pulse}
      className={className}
    >
      {displayLabel}
    </Badge>
  );
};

export default StatusBadge;

