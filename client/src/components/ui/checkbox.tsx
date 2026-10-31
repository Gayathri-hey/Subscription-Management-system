import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex items-start space-x-2.5">
        <div className="relative flex items-center pt-0.5">
          <input
            id={inputId}
            type="checkbox"
            checked={checked}
            ref={ref}
            className={cn(
              'peer h-4 w-4 shrink-0 rounded border border-input bg-card/60 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none checked:bg-primary checked:border-primary transition-all cursor-pointer',
              className
            )}
            {...props}
          />
          <Check className="pointer-events-none absolute left-0.5 top-1 h-3 w-3 stroke-[3] text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        {(label || description) && (
          <div className="grid gap-0.5 leading-none">
            {label && (
              <label
                htmlFor={inputId}
                className="text-sm font-medium text-foreground cursor-pointer select-none"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-muted-foreground select-none">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

