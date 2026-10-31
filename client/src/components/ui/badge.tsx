import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none border',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-rose-500/30 bg-rose-500/15 text-rose-400 dark:text-rose-300',
        outline: 'border-border text-foreground bg-transparent',
        success: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400 dark:text-emerald-300',
        warning: 'border-amber-500/30 bg-amber-500/15 text-amber-400 dark:text-amber-300',
        info: 'border-sky-500/30 bg-sky-500/15 text-sky-400 dark:text-sky-300',
        purple: 'border-purple-500/30 bg-purple-500/15 text-purple-400 dark:text-purple-300',
      },
      size: {
        sm: 'px-2 py-0.2 text-[10px]',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  pulse?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  dot = false,
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      {children}
    </div>
  );
}

