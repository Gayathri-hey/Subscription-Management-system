import React from 'react';
import { AlertCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export interface InlineErrorMessageProps {
  message?: string | null;
  className?: string;
}

export const InlineErrorMessage: React.FC<InlineErrorMessageProps> = ({
  message,
  className,
}) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        'flex items-center space-x-1.5 text-xs font-medium text-rose-500 animate-in fade-in',
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  statusCode?: number;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this data. Please try again or contact support if the issue persists.',
  statusCode,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/5 p-8 text-center text-foreground',
        className
      )}
      role="alert"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4 border border-rose-500/20">
        <AlertTriangle className="h-7 w-7" />
      </div>

      <h3 className="text-lg font-semibold text-foreground tracking-tight">
        {title}
        {statusCode && (
          <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
            {statusCode}
          </span>
        )}
      </h3>

      <p className="max-w-md text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          leftIcon={<RefreshCw className="h-4 w-4" />}
          className="border-rose-500/30 hover:bg-rose-500/10 text-rose-300"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export interface ErrorBannerProps {
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'Error',
  message,
  className,
}) => {
  return (
    <Alert variant="destructive" className={cn('my-4', className)}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default {
  Inline: InlineErrorMessage,
  State: ErrorState,
  Banner: ErrorBanner,
};

