import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, leftAdornment, rightAdornment, ...props }, ref) => {
    return (
      <div className="relative flex w-full items-center">
        {leftAdornment && (
          <div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground">
            {leftAdornment}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border border-input bg-card/60 px-3 py-2 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
            leftAdornment && 'pl-10',
            rightAdornment && 'pr-10',
            error && 'border-rose-500 focus-visible:ring-rose-500/50',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        {rightAdornment && (
          <div className="absolute right-3 flex items-center text-muted-foreground">
            {rightAdornment}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

