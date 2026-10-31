import React, { useState } from 'react';
import { Users, UserPlus, Mail, Phone, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';

interface CustomerRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  activeSubscriptionsCount: number;
  joinedAt: string;
}

const mockCustomers: CustomerRecord[] = [
  {
    id: 'c1',
    name: 'David Miller',
    company: 'Acme Technologies Inc.',
    email: 'david@acmecorp.com',
    phone: '+1 (555) 349-2049',
    status: 'ACTIVE',
    activeSubscriptionsCount: 2,
    joinedAt: '2026-02-10',
  },
  {
    id: 'c2',
    name: 'Sarah Connor',
    company: 'Cyberdyne Systems',
    email: 's.connor@cyberdyne.io',
    phone: '+1 (555) 992-1209',
    status: 'ACTIVE',
    activeSubscriptionsCount: 1,
    joinedAt: '2026-04-18',
  },
  {
    id: 'c3',
    name: 'Liam Gallagher',
    company: 'Manchester Dynamics',
    email: 'liam@mcr-dyn.co.uk',
    phone: '+44 20 7946 0912',
    status: 'INACTIVE',
    activeSubscriptionsCount: 0,
    joinedAt: '2026-06-01',
  },
];

export const StaffCustomers: React.FC = () => {
  const [customers] = useState<CustomerRecord[]>(mockCustomers);

  const columns: Column<CustomerRecord>[] = [
    {
      key: 'name',
      header: 'Customer & Company',
      sortable: true,
      accessor: (r) => (
        <div>
          <div className="font-semibold text-foreground">{r.name}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Building className="h-3 w-3" />
            <span>{r.company}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Contact Info',
      sortable: true,
      accessor: (r) => (
        <div className="space-y-0.5">
          <div className="text-xs font-mono flex items-center gap-1 text-foreground">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{r.email}</span>
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" />
            <span>{r.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'activeSubscriptionsCount',
      header: 'Active Subs',
      sortable: true,
      accessor: (r) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
          {r.activeSubscriptionsCount} active
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
      key: 'joinedAt',
      header: 'Customer Since',
      sortable: true,
      accessor: (r) => (
        <span className="text-muted-foreground">{formatDate(r.joinedAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Customer Accounts
          </h2>
          <p className="text-sm text-muted-foreground">
            Direct access to customer profiles, subscription status, and billing logs.
          </p>
        </div>

        <Button leftIcon={<UserPlus className="h-4 w-4" />}>Add Customer</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>All registered corporate and individual customer accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={customers}
            columns={columns}
            keyExtractor={(c) => c.id}
            searchable={true}
            searchPlaceholder="Search by name, company or email..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffCustomers;

