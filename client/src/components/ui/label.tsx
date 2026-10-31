import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none inline-flex items-center gap-1',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-rose-500 font-bold">*</span>}
      </label>
    );
  }
);
Label.displayName = 'Label';

