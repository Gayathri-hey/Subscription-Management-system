import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { formatCurrency, formatDate } from '@/lib/utils';

export const CustomerSubscriptions: React.FC = () => {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  const handleConfirmCancel = () => {
    setIsCancelled(true);
    setCancelModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          My Subscriptions
        </h2>
        <p className="text-sm text-muted-foreground">
          Review your current active plans, upgrade bandwidth/seats, or manage renewal preferences.
        </p>
      </div>

      <Card className="border-primary/40 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-xl">Enterprise Cloud Tier</CardTitle>
                <StatusBadge status={isCancelled ? 'CANCELLED' : 'ACTIVE'} />
              </div>
              <CardDescription className="mt-1">
                Subscription Reference: <span className="font-mono text-primary font-semibold">SUB-2026-901</span>
              </CardDescription>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-foreground">
                {formatCurrency(1188)}
              </span>
              <span className="text-xs text-muted-foreground"> / month</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-card/60 border border-border/60">
            <div>
              <span className="text-xs uppercase font-semibold text-muted-foreground">
                Billing Cycle
              </span>
              <p className="text-sm font-semibold text-foreground mt-0.5">Monthly (Auto-renew)</p>
            </div>
            <div>
              <span className="text-xs uppercase font-semibold text-muted-foreground">
                Current Term Ends
              </span>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatDate('2026-11-20')}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase font-semibold text-muted-foreground">
                Payment Method
              </span>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                Mastercard ending in 4242
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Included Entitlements
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-foreground">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Unlimited team members</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>1 TB Dedicated high-speed storage</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>99.99% Guaranteed uptime SLA</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>24/7 Priority technical support</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <Button variant="outline" size="sm">
            Update Payment Method
          </Button>
          <div className="flex items-center space-x-2">
            {!isCancelled && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setCancelModalOpen(true)}
              >
                Cancel Subscription
              </Button>
            )}
            <Button size="sm">Upgrade Tier</Button>
          </div>
        </CardFooter>
      </Card>

      <ConfirmationDialog
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        title="Cancel Subscription"
        description="Are you sure you want to cancel your Enterprise Cloud Tier subscription? Your services will remain operational until November 20, 2026, after which your account will revert to the free plan."
        confirmLabel="Confirm Cancellation"
        variant="danger"
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};

export default CustomerSubscriptions;

