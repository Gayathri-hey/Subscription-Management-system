import React, { useState } from 'react';
import { Plus, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  planName: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const mockQuotations: Quotation[] = [
  {
    id: 'q_1',
    quotationNumber: 'QT-2026-001',
    customerName: 'Acme Technologies Inc.',
    planName: 'Enterprise Cloud Tier',
    subtotal: 1200,
    discount: 100,
    tax: 88,
    total: 1188,
    status: 'SENT',
    createdAt: '2026-10-20',
  },
  {
    id: 'q_2',
    quotationNumber: 'QT-2026-002',
    customerName: 'Starlight Tech Inc.',
    planName: 'Growth Suite',
    subtotal: 499,
    discount: 0,
    tax: 39.92,
    total: 538.92,
    status: 'APPROVED',
    createdAt: '2026-10-22',
  },
  {
    id: 'q_3',
    quotationNumber: 'QT-2026-003',
    customerName: 'Omni Media Group',
    planName: 'Custom Multi-tenant Plan',
    subtotal: 3500,
    discount: 300,
    tax: 256,
    total: 3456,
    status: 'DRAFT',
    createdAt: '2026-10-28',
  },
];

export const StaffQuotations: React.FC = () => {
  const [quotations] = useState<Quotation[]>(mockQuotations);

  const columns: Column<Quotation>[] = [
    {
      key: 'quotationNumber',
      header: 'Quote #',
      sortable: true,
      accessor: (r) => (
        <span className="font-mono font-semibold text-primary">{r.quotationNumber}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
    },
    {
      key: 'planName',
      header: 'Selected Plan',
      sortable: true,
      accessor: (r) => <span className="text-muted-foreground">{r.planName}</span>,
    },
    {
      key: 'total',
      header: 'Total Value',
      sortable: true,
      accessor: (r) => (
        <span className="font-mono font-semibold text-foreground">
          {formatCurrency(r.total)}
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
      key: 'createdAt',
      header: 'Created On',
      sortable: true,
      accessor: (r) => (
        <span className="text-muted-foreground">{formatDate(r.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      accessor: (r) => (
        <div className="flex items-center justify-end space-x-1">
          {r.status === 'DRAFT' && (
            <Button variant="ghost" size="icon-sm" title="Send to Customer">
              <Send className="h-3.5 w-3.5 text-sky-400" />
            </Button>
          )}
          {r.status === 'SENT' && (
            <span className="text-xs text-muted-foreground italic">Sent to client</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Quotation Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Generate customized pricing quotations, send quotes to clients, and convert to active subscriptions.
          </p>
        </div>

        <Button leftIcon={<Plus className="h-4 w-4" />}>Create Quotation</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quotations</CardTitle>
          <CardDescription>Pipeline of draft, dispatched, and approved commercial offers.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={quotations}
            columns={columns}
            keyExtractor={(q) => q.id}
            searchable={true}
            searchPlaceholder="Search quotation number or client..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffQuotations;

