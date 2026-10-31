import React, { useState } from 'react';
import { FileText, Download, CheckCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  period: string;
  issuedDate: string;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

const mockInvoices: CustomerInvoice[] = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-2026-0091',
    period: 'Oct 20, 2026 - Nov 20, 2026',
    issuedDate: '2026-10-20',
    dueDate: '2026-11-03',
    amount: 1188,
    status: 'PAID',
  },
  {
    id: 'inv_2',
    invoiceNumber: 'INV-2026-0082',
    period: 'Sep 20, 2026 - Oct 20, 2026',
    issuedDate: '2026-09-20',
    dueDate: '2026-10-04',
    amount: 1188,
    status: 'PAID',
  },
  {
    id: 'inv_3',
    invoiceNumber: 'INV-2026-0073',
    period: 'Aug 20, 2026 - Sep 20, 2026',
    issuedDate: '2026-08-20',
    dueDate: '2026-09-03',
    amount: 1188,
    status: 'PAID',
  },
];

export const CustomerInvoices: React.FC = () => {
  const [invoices] = useState<CustomerInvoice[]>(mockInvoices);

  const columns: Column<CustomerInvoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      accessor: (r) => (
        <span className="font-mono font-semibold text-primary">{r.invoiceNumber}</span>
      ),
    },
    {
      key: 'period',
      header: 'Billing Period',
      sortable: true,
      accessor: (r) => <span className="text-muted-foreground">{r.period}</span>,
    },
    {
      key: 'issuedDate',
      header: 'Issued On',
      sortable: true,
      accessor: (r) => (
        <span className="text-muted-foreground">{formatDate(r.issuedDate)}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Total Billed',
      sortable: true,
      accessor: (r) => (
        <span className="font-mono font-semibold text-foreground">
          {formatCurrency(r.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Payment Status',
      sortable: true,
      accessor: (r) => <StatusBadge status={r.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Download',
      align: 'right',
      accessor: () => (
        <Button variant="ghost" size="icon-sm" title="Download PDF Statement">
          <Download className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Billing & Invoices
        </h2>
        <p className="text-sm text-muted-foreground">
          View official tax invoices, payment receipts, and settlement history.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Statements generated for your account subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={invoices}
            columns={columns}
            keyExtractor={(i) => i.id}
            searchable={true}
            searchPlaceholder="Search invoice number..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerInvoices;

