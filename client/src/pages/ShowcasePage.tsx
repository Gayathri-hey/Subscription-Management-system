import React, { useState } from 'react';
import {
  Sparkles,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/shared/FormField';
import { StatusBadge, type EntityStatus } from '@/components/shared/StatusBadge';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { CardGridSkeleton } from '@/components/shared/LoadingSkeleton';
import { SearchEmptyState, SubscriptionsEmptyState } from '@/components/shared/EmptyState';
import { InlineErrorMessage, ErrorState, ErrorBanner } from '@/components/shared/ErrorMessage';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SampleItem {
  id: string;
  name: string;
  category: string;
  price: number;
  status: EntityStatus;
  date: string;
}

const sampleData: SampleItem[] = [
  { id: '1', name: 'Enterprise Cloud Plus', category: 'Software', price: 1299, status: 'ACTIVE', date: '2026-10-01' },
  { id: '2', name: 'Growth Analytics Suite', category: 'Analytics', price: 499, status: 'TRIALING', date: '2026-10-05' },
  { id: '3', name: 'Standard Seat Pack (10)', category: 'Add-on', price: 99, status: 'PAID', date: '2026-10-10' },
  { id: '4', name: 'Legacy Data Pipeline', category: 'Storage', price: 250, status: 'EXPIRED', date: '2026-09-15' },
  { id: '5', name: 'Custom Gateway SLA', category: 'Network', price: 750, status: 'PENDING', date: '2026-10-22' },
  { id: '6', name: 'Security Audit Add-on', category: 'Security', price: 350, status: 'CANCELLED', date: '2026-08-30' },
  { id: '7', name: 'Dedicated Support Bot', category: 'AI', price: 150, status: 'PAUSED', date: '2026-10-18' },
];

export const ShowcasePage: React.FC = () => {
  // Confirmation Dialog States
  const [dangerDialogOpen, setDangerDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [primaryDialogOpen, setPrimaryDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Form Field State
  const [sampleInput, setSampleInput] = useState('Acme Technologies');
  const [sampleErrorInput, setSampleErrorInput] = useState('');
  const [sampleSelect, setSampleSelect] = useState('monthly');
  const [showFormErrors, setShowFormErrors] = useState(true);

  // Skeletons Toggle
  const [showTableSkeleton, setShowTableSkeleton] = useState(false);
  const [showCardSkeleton, setShowCardSkeleton] = useState(false);

  const tableColumns: Column<SampleItem>[] = [
    { key: 'name', header: 'Item Name', sortable: true, accessor: (r) => <span className="font-semibold">{r.name}</span> },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'price', header: 'Price', sortable: true, accessor: (r) => <span className="font-mono font-medium">{formatCurrency(r.price)}</span> },
    { key: 'status', header: 'Status', sortable: true, accessor: (r) => <StatusBadge status={r.status} /> },
    { key: 'date', header: 'Date', sortable: true, accessor: (r) => <span className="text-muted-foreground">{formatDate(r.date)}</span> },
  ];

  const handleSimulatedConfirm = async () => {
    setDialogLoading(true);
    await new Promise((res) => setTimeout(res, 800));
    setDialogLoading(false);
    setDangerDialogOpen(false);
    setWarningDialogOpen(false);
    setPrimaryDialogOpen(false);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Intro Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Task 2 UI Component Showcase
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Interactive catalog of all reusable frontend design system components configured with Tailwind CSS, shadcn/ui design tokens, and TypeScript.
        </p>
      </div>

      {/* 1. Status Badges */}
      <Card>
        <CardHeader>
          <CardTitle>1. Status Badges</CardTitle>
          <CardDescription>
            Dynamic status pills with subtle borders and animated pulsing indicators.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status="ACTIVE" />
            <StatusBadge status="TRIALING" />
            <StatusBadge status="PAID" />
            <StatusBadge status="APPROVED" />
            <StatusBadge status="PENDING" />
            <StatusBadge status="PAUSED" />
            <StatusBadge status="DRAFT" />
            <StatusBadge status="OVERDUE" />
            <StatusBadge status="EXPIRED" />
            <StatusBadge status="CANCELLED" />
            <StatusBadge status="SUSPENDED" />
          </div>

          <div className="pt-2 border-t border-border/50">
            <span className="text-xs uppercase font-semibold text-muted-foreground block mb-2">
              Role Badges
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status="ADMIN" />
              <StatusBadge status="STAFF" />
              <StatusBadge status="CUSTOMER" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Form Fields */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>2. Form Fields</CardTitle>
              <CardDescription>
                Reusable composite fields with labels, error states, and helper descriptions.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFormErrors(!showFormErrors)}
            >
              Toggle Error States
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Company Name"
              required
              value={sampleInput}
              onChange={(e) => setSampleInput(e.target.value)}
              helperText="Official company name for quotation billing"
            />

            <FormField
              label="Work Email Address"
              type="email"
              required
              value={sampleErrorInput}
              onChange={(e) => setSampleErrorInput(e.target.value)}
              placeholder="e.g. alex@example.com"
              error={
                showFormErrors && !sampleErrorInput
                  ? 'A valid email address is required to dispatch billing tokens.'
                  : undefined
              }
            />

            <FormField
              label="Billing Interval"
              type="select"
              value={sampleSelect}
              onChange={(e) => setSampleSelect(e.target.value)}
              options={[
                { value: 'monthly', label: 'Monthly Billing Cycle' },
                { value: 'quarterly', label: 'Quarterly Billing Cycle' },
                { value: 'yearly', label: 'Annual Billing (Save 15%)' },
              ]}
              helperText="Cycles are automatically evaluated by the recurring billing cron"
            />

            <FormField
              label="Internal Operations Notes"
              type="textarea"
              placeholder="Add any specific discount or custom SLA terms..."
              helperText="Visible only to Admin and Staff roles"
            />
          </div>

          <div className="mt-6 pt-4 border-t border-border/50">
            <Checkbox
              label="Send automatic email notifications on invoice generation"
              description="Sends an email statement using Nodemailer when the node-cron job executes."
              defaultChecked
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Confirmation Dialogs */}
      <Card>
        <CardHeader>
          <CardTitle>3. Confirmation Dialogs</CardTitle>
          <CardDescription>
            Accessible modal dialogs for high-impact actions with keyboard shortcuts and loading state.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Button
            variant="destructive"
            onClick={() => setDangerDialogOpen(true)}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Open Danger Dialog
          </Button>

          <Button
            variant="outline"
            onClick={() => setWarningDialogOpen(true)}
            leftIcon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
          >
            Open Warning Dialog
          </Button>

          <Button
            variant="default"
            onClick={() => setPrimaryDialogOpen(true)}
          >
            Open Primary Dialog
          </Button>
        </CardContent>
      </Card>

      {/* Danger Modal */}
      <ConfirmationDialog
        open={dangerDialogOpen}
        onOpenChange={setDangerDialogOpen}
        title="Delete Subscription Record"
        description="Are you sure you want to permanently delete this subscription? This action will void future scheduled invoices and revoke client portal access immediately."
        confirmLabel="Yes, Delete Permanently"
        variant="danger"
        isLoading={dialogLoading}
        onConfirm={handleSimulatedConfirm}
      />

      {/* Warning Modal */}
      <ConfirmationDialog
        open={warningDialogOpen}
        onOpenChange={setWarningDialogOpen}
        title="Suspend Account Privileges"
        description="Suspending this user will terminate their active session and prevent API authentication until an administrator reactivates the account."
        confirmLabel="Suspend User"
        variant="warning"
        isLoading={dialogLoading}
        onConfirm={handleSimulatedConfirm}
      />

      {/* Primary Modal */}
      <ConfirmationDialog
        open={primaryDialogOpen}
        onOpenChange={setPrimaryDialogOpen}
        title="Approve Quotation"
        description="Approving this quotation will automatically convert it into an active subscription and dispatch the first onboarding invoice."
        confirmLabel="Approve & Convert"
        variant="primary"
        isLoading={dialogLoading}
        onConfirm={handleSimulatedConfirm}
      />

      {/* 4. Data Table Component */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>4. Data Table Component</CardTitle>
              <CardDescription>
                Full-featured data grid with sorting, search filter, responsive pagination, and loading skeleton integration.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTableSkeleton(!showTableSkeleton)}
            >
              {showTableSkeleton ? 'Show Data' : 'Show Skeleton'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={sampleData}
            columns={tableColumns}
            keyExtractor={(i) => i.id}
            isLoading={showTableSkeleton}
            searchable={true}
            searchPlaceholder="Search catalog items..."
          />
        </CardContent>
      </Card>

      {/* 5. Loading Skeletons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>5. Loading Skeletons</CardTitle>
              <CardDescription>
                Smooth animated pulse skeletons for metric cards, data tables, and full dashboards.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCardSkeleton(!showCardSkeleton)}
            >
              Toggle Skeleton Grid
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCardSkeleton ? (
            <CardGridSkeleton count={4} columns={4} />
          ) : (
            <p className="text-xs text-muted-foreground">
              Click &quot;Toggle Skeleton Grid&quot; to preview animated metric card skeletons.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 6. Empty States */}
      <Card>
        <CardHeader>
          <CardTitle>6. Empty States</CardTitle>
          <CardDescription>
            Clean placeholders when records or search queries return no data.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SubscriptionsEmptyState onNew={() => alert('New subscription triggered!')} />
          <SearchEmptyState query="Unknown Product SKU" onClear={() => alert('Search cleared!')} />
        </CardContent>
      </Card>

      {/* 7. Error Messages & Banners */}
      <Card>
        <CardHeader>
          <CardTitle>7. Error Messages & Error States</CardTitle>
          <CardDescription>
            Standardized error representations across inline forms, top banners, and full-card error boundaries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Inline Field Error
            </span>
            <InlineErrorMessage message="Unable to verify corporate tax ID with the regional authority." />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Top Notification Banner
            </span>
            <ErrorBanner
              title="Payment Gateway Connectivity Warning"
              message="The webhook endpoint timed out during verification. Incoming invoice settlements may be queued."
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Section Error State with Retry
            </span>
            <ErrorState
              title="Failed to Load Financial Metrics"
              message="The Express backend API returned a 503 Service Unavailable response while calculating MRR."
              statusCode={503}
              onRetry={() => alert('Retry triggered!')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShowcasePage;

