import React from 'react';
import {
  TrendingUp,
  Users,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  Plus,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface RecentSubscription {
  id: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  amount: number;
  interval: string;
  status: 'ACTIVE' | 'TRIALING' | 'PENDING' | 'EXPIRED';
  startDate: string;
}

const mockSubscriptions: RecentSubscription[] = [
  {
    id: 'sub_101',
    customerName: 'Starlight Tech Inc.',
    customerEmail: 'billing@starlight.io',
    planName: 'Enterprise Tier',
    amount: 1499,
    interval: 'monthly',
    status: 'ACTIVE',
    startDate: '2026-10-15',
  },
  {
    id: 'sub_102',
    customerName: 'Acro Logistics',
    customerEmail: 'ops@acro.com',
    planName: 'Growth Tier',
    amount: 499,
    interval: 'monthly',
    status: 'ACTIVE',
    startDate: '2026-10-18',
  },
  {
    id: 'sub_103',
    customerName: 'Fintech Solutions',
    customerEmail: 'finance@fintech.co',
    planName: 'Professional',
    amount: 199,
    interval: 'monthly',
    status: 'TRIALING',
    startDate: '2026-10-24',
  },
  {
    id: 'sub_104',
    customerName: 'Nexus Studio',
    customerEmail: 'contact@nexus.design',
    planName: 'Starter Tier',
    amount: 49,
    interval: 'monthly',
    status: 'PENDING',
    startDate: '2026-10-29',
  },
  {
    id: 'sub_105',
    customerName: 'Vanguard Media',
    customerEmail: 'accounts@vanguard.media',
    planName: 'Growth Tier',
    amount: 499,
    interval: 'monthly',
    status: 'EXPIRED',
    startDate: '2026-09-01',
  },
];

export const AdminDashboard: React.FC = () => {
  const columns: Column<RecentSubscription>[] = [
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      accessor: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.customerName}</div>
          <div className="text-xs text-muted-foreground">{row.customerEmail}</div>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Plan',
      sortable: true,
      accessor: (row) => (
        <span className="font-medium text-foreground">{row.planName}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Billing Rate',
      sortable: true,
      accessor: (row) => (
        <div>
          <span className="font-mono font-semibold text-foreground">
            {formatCurrency(row.amount)}
          </span>
          <span className="text-xs text-muted-foreground">/{row.interval}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'startDate',
      header: 'Created On',
      sortable: true,
      accessor: (row) => (
        <span className="text-muted-foreground">{formatDate(row.startDate)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Admin Control Center
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            System overview, recurring billing health, and real-time revenue analytics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline">Download Report</Button>
          <Button leftIcon={<Plus className="h-4 w-4" />}>Create Plan</Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly Recurring (MRR)
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">$48,250</div>
            <div className="flex items-center text-xs text-emerald-400 mt-1">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              <span>+14.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Subscriptions
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">1,248</div>
            <div className="flex items-center text-xs text-emerald-400 mt-1">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              <span>+32 new this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Customers
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">3,892</div>
            <div className="flex items-center text-xs text-emerald-400 mt-1">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              <span>+8.4% growth</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Churn Rate
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">1.8%</div>
            <div className="flex items-center text-xs text-emerald-400 mt-1">
              <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
              <span>-0.4% improvement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Subscriptions Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Subscription Activity</CardTitle>
              <CardDescription>
                Live stream of subscription creations, renewals, and lifecycle events.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={mockSubscriptions}
            columns={columns}
            keyExtractor={(item) => item.id}
            searchable={true}
            searchPlaceholder="Search by customer or plan..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

