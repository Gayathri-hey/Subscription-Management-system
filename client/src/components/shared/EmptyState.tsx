import React from 'react';
import {
  FileQuestion,
  Search,
  Plus,
  Users,
  CreditCard,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  bordered?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileQuestion,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  bordered = true,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12',
        bordered && 'rounded-xl border border-dashed border-border bg-card/40',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4 shadow-inner">
        <Icon className="h-8 w-8 text-primary" />
      </div>

      <h3 className="text-lg font-semibold text-foreground tracking-tight mb-1.5">
        {title}
      </h3>

      <p className="max-w-md text-sm text-muted-foreground mb-6 leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            <Button
              onClick={onAction}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/** Preset empty states for fast reuse across domain pages */
export const SearchEmptyState: React.FC<{ query?: string; onClear?: () => void }> = ({
  query,
  onClear,
}) => (
  <EmptyState
    icon={Search}
    title="No matching results found"
    description={
      query
        ? `We couldn't find anything matching "${query}". Try checking for typos or searching for a different term.`
        : 'No records match your filter criteria. Try resetting or adjusting your search filters.'
    }
    actionLabel={onClear ? 'Clear Search' : undefined}
    onAction={onClear}
  />
);

export const SubscriptionsEmptyState: React.FC<{ onNew?: () => void }> = ({ onNew }) => (
  <EmptyState
    icon={CreditCard}
    title="No subscriptions yet"
    description="There are currently no active or pending subscriptions. Create a new subscription or send a quotation to get started."
    actionLabel={onNew ? 'Create Subscription' : undefined}
    onAction={onNew}
  />
);

export const CustomersEmptyState: React.FC<{ onNew?: () => void }> = ({ onNew }) => (
  <EmptyState
    icon={Users}
    title="No customers found"
    description="Your customer directory is empty. Add your first customer or wait for self-service signups."
    actionLabel={onNew ? 'Add Customer' : undefined}
    onAction={onNew}
  />
);

export const InvoicesEmptyState: React.FC<{ onNew?: () => void }> = ({ onNew }) => (
  <EmptyState
    icon={FileText}
    title="No invoices generated"
    description="Invoices will appear here automatically when billing cycles execute or when created manually."
    actionLabel={onNew ? 'Generate Invoice' : undefined}
    onAction={onNew}
  />
);

export default EmptyState;

