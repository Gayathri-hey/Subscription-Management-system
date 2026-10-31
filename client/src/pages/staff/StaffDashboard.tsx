import React from 'react';
import { Briefcase, FileText, Users, CreditCard, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface PendingQuotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  total: number;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
  validUntil: string;
}

const mockQuotes: PendingQuotation[] = [
  {
    id: 'q1',
    quotationNumber: 'QT-2026-081',
    customerName: 'Horizon Therapeutics',
    total: 3200,
    status: 'SENT',
    validUntil: '2026-11-15',
  },
  {
    id: 'q2',
    quotationNumber: 'QT-2026-082',
    customerName: 'Quantum Dynamics',
    total: 5800,
    status: 'DRAFT',
    validUntil: '2026-11-20',
  },
  {
    id: 'q3',
    quotationNumber: 'QT-2026-083',
    customerName: 'Solaris Systems',
    total: 1250,
    status: 'APPROVED',
    validUntil: '2026-11-05',
  },
];

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();

  const columns: Column<PendingQuotation>[] = [
    {
      key: 'quotationNumber',
      header: 'Quote #',
      sortable: true,
      accessor: (r) => <span className="font-mono font-semibold text-primary">{r.quotationNumber}</span>,
    },
    {
      key: 'customerName',
      header: 'Client',
      sortable: true,
    },
    {
      key: 'total',
      header: 'Amount',
      sortable: true,
      accessor: (r) => <span className="font-mono font-semibold">{formatCurrency(r.total)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (r) => <StatusBadge status={r.status} size="sm" />,
    },
    {
      key: 'validUntil',
      header: 'Expires',
      sortable: true,
      accessor: (r) => <span className="text-muted-foreground">{formatDate(r.validUntil)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-sky-400" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Staff Operations Portal
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage customer relationships, draft custom quotations, and provision client subscriptions.
          </p>
        </div>

        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => navigate('/staff/quotations')}
        >
          New Quotation
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">
              Pending Quotes
            </CardTitle>
            <FileText className="h-4 w-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">14</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting client approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">
              Assigned Accounts
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">48</div>
            <p className="text-xs text-muted-foreground mt-1">Managed accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">
              Renewals This Week
            </CardTitle>
            <CreditCard className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">9</div>
            <p className="text-xs text-muted-foreground mt-1">Require follow-up</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Quotations</CardTitle>
              <CardDescription>Quotes drafted and issued to enterprise leads</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => navigate('/staff/quotations')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={mockQuotes}
            columns={columns}
            keyExtractor={(q) => q.id}
            searchable={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;

