import React from 'react';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ConfirmationVariant = 'danger' | 'warning' | 'primary' | 'info';

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmationVariant;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

const variantStyles: Record<
  ConfirmationVariant,
  {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    confirmButtonVariant: 'destructive' | 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success';
  }
> = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-rose-500/10 border-rose-500/20',
    iconColor: 'text-rose-500',
    confirmButtonVariant: 'destructive',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-500',
    confirmButtonVariant: 'default',
  },
  primary: {
    icon: Info,
    iconBg: 'bg-primary/10 border-primary/20',
    iconColor: 'text-primary',
    confirmButtonVariant: 'default',
  },
  info: {
    icon: Info,
    iconBg: 'bg-sky-500/10 border-sky-500/20',
    iconColor: 'text-sky-400',
    confirmButtonVariant: 'default',
  },
};

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const currentVariant = variantStyles[variant];
  const IconComponent = currentVariant.icon;

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={handleCancel}>
        <div className="flex items-start space-x-4">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border p-2',
              currentVariant.iconBg
            )}
          >
            <IconComponent className={cn('h-6 w-6', currentVariant.iconColor)} />
          </div>

          <div className="flex-1">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {typeof description === 'string' ? (
                <DialogDescription>{description}</DialogDescription>
              ) : (
                <div className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {description}
                </div>
              )}
            </DialogHeader>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
              <Button
                type="button"
                variant={currentVariant.confirmButtonVariant}
                onClick={handleConfirm}
                isLoading={isLoading}
              >
                {confirmLabel}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;

