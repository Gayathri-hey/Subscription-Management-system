import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface StaffSubscription {
  id: string;
  subscriptionCode: string;
  customerName: string;
  planName: string;
  rate: number;
  interval: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'PENDING';
  nextBillingDate: string;
}

const mockStaffSubs: StaffSubscription[] = [
  {
    id: 's_01',
    subscriptionCode: 'SUB-2026-901',
    customerName: 'Acme Technologies Inc.',
    planName: 'Enterprise Cloud Tier',
    rate: 1188,
    interval: 'monthly',
    status: 'ACTIVE',
    nextBillingDate: '2026-11-20',
  },
  {
    id: 's_02',
    subscriptionCode: 'SUB-2026-902',
    customerName: 'Cyberdyne Systems',
    planName: 'Growth Suite',
    rate: 499,
    interval: 'monthly',
    status: 'ACTIVE',
    nextBillingDate: '2026-11-18',
  },
  {
    id: 's_03',
    subscriptionCode: 'SUB-2026-903',
    customerName: 'Omni Media Group',
    planName: 'Starter Tier',
    rate: 49,
    interval: 'monthly',
    status: 'PAUSED',
    nextBillingDate: '2026-12-01',
  },
];

export const StaffSubscriptions: React.FC = () => {
  const [subscriptions] = useState<StaffSubscription[]>(mockStaffSubs);

  const columns: Column<StaffSubscription>[] = [
    {
      key: 'subscriptionCode',
      header: 'Sub ID',
      sortable: true,
      accessor: (r) => (
        <span className="font-mono font-semibold text-primary">{r.subscriptionCode}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
    },
    {
      key: 'planName',
      header: 'Plan Tier',
      sortable: true,
      accessor: (r) => <span className="text-muted-foreground">{r.planName}</span>,
    },
    {
      key: 'rate',
      header: 'Recurring Rate',
      sortable: true,
      accessor: (r) => (
        <span className="font-mono font-semibold">
          {formatCurrency(r.rate)}/{r.interval}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (r) => <StatusBadge status={r.status} size="sm" />,
    },
    {
      key: 'nextBillingDate',
      header: 'Next Billing',
      sortable: true,
      accessor: (r) => (
        <span className="text-muted-foreground">{formatDate(r.nextBillingDate)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Customer Subscriptions
          </h2>
          <p className="text-sm text-muted-foreground">
            Monitor and manage provisioned client accounts, renewals, pauses, and cancellations.
          </p>
        </div>

        <Button leftIcon={<Plus className="h-4 w-4" />}>Provision Subscription</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
          <CardDescription>All provisioned recurring billing plans across customer base.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={subscriptions}
            columns={columns}
            keyExtractor={(s) => s.id}
            searchable={true}
            searchPlaceholder="Search subscription code or customer..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffSubscriptions;

