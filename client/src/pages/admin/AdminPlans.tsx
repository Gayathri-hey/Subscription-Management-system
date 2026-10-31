import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plus, RefreshCw, AlertCircle, Search, Archive,
  Trash2, Edit, Clock, Calendar, Check, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { plansApi, type Plan } from '@/services/plans.api';
import { formatCurrency, formatDate } from '@/lib/utils';

const BILLING_LABELS: Record<string, string> = {
  daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly',
  yearly: 'Yearly', quarterly: 'Quarterly', semi_annual: 'Semi-Annual', one_time: 'One-time',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  draft: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  archived: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export const AdminPlans: React.FC = () => {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [intervalFilter, setIntervalFilter] = useState('');

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'archive' | 'delete';
    plan?: Plan;
  }>({ open: false, type: 'archive' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await plansApi.list({
        page,
        limit: 12,
        search: search || undefined,
        status: statusFilter || undefined,
        billingInterval: intervalFilter || undefined,
      });
      setPlans((resp.data as any) || []);
      setTotalPages((resp as any).meta?.totalPages ?? 1);
      setTotal((resp as any).meta?.total ?? 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, intervalFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchPlans, 300);
    return () => clearTimeout(timer);
  }, [fetchPlans]);

  const handleArchive = async () => {
    if (!confirmDialog.plan) return;
    setActionLoading(true);
    try {
      await plansApi.archive(confirmDialog.plan._id);
      setConfirmDialog({ open: false, type: 'archive' });
      fetchPlans();
    } catch (e: any) {
      setError(e?.message || 'Archive failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDialog.plan) return;
    setActionLoading(true);
    try {
      await plansApi.delete(confirmDialog.plan._id);
      setConfirmDialog({ open: false, type: 'delete' });
      fetchPlans();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const hasFilters = search || statusFilter || intervalFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Subscription Plans</h2>
          <p className="text-sm text-muted-foreground">
            Configure billing intervals, pricing, and plan policies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPlans} className="hidden sm:flex">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button id="create-plan-btn" onClick={() => navigate('/admin/plans/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Plans', value: total },
          { label: 'Active', value: plans.filter(p => p.status === 'active').length },
          { label: 'Draft', value: plans.filter(p => p.status === 'draft').length },
          { label: 'Archived', value: plans.filter(p => p.status === 'archived').length },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="text-2xl font-bold font-mono text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="plan-search"
                placeholder="Search plans..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter || 'all'} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-[140px]" id="plan-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={intervalFilter || 'all'} onValueChange={(v) => { setIntervalFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-[150px]" id="billing-interval-filter">
                <SelectValue placeholder="Interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intervals</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter(''); setIntervalFilter(''); setPage(1); }}>
                Clear
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingSkeleton key={i} variant="card" className="h-64" />
              ))}
            </div>
          )}

          {!loading && plans.length === 0 && (
            <EmptyState
              icon={<LayoutGrid className="h-12 w-12" />}
              title="No plans found"
              description={hasFilters ? 'Try adjusting your filters.' : 'Create your first subscription plan.'}
              action={
                !hasFilters ? (
                  <Button onClick={() => navigate('/admin/plans/new')}>
                    <Plus className="h-4 w-4 mr-2" /> Create Plan
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter(''); setIntervalFilter(''); }}>
                    Clear Filters
                  </Button>
                )
              }
            />
          )}

          {!loading && plans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  onEdit={() => navigate(`/admin/plans/${plan._id}`)}
                  onArchive={() => setConfirmDialog({ open: true, type: 'archive', plan })}
                  onDelete={() => setConfirmDialog({ open: true, type: 'delete', plan })}
                />
              ))}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm dialogs */}
      <ConfirmationDialog
        open={confirmDialog.open && confirmDialog.type === 'archive'}
        onOpenChange={(open) => setConfirmDialog(d => ({ ...d, open }))}
        title="Archive Plan"
        description={`Archive "${confirmDialog.plan?.name}"? It will be hidden from new subscriptions.`}
        confirmLabel="Archive"
        onConfirm={handleArchive}
        isLoading={actionLoading}
        variant="warning"
      />
      <ConfirmationDialog
        open={confirmDialog.open && confirmDialog.type === 'delete'}
        onOpenChange={(open) => setConfirmDialog(d => ({ ...d, open }))}
        title="Delete Plan"
        description={`Permanently delete "${confirmDialog.plan?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={actionLoading}
        variant="danger"
      />
    </div>
  );
};

// ─── Plan Card ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: Plan;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

const CONFIG_FLAGS = [
  { key: 'autoClose', label: 'Auto-close' },
  { key: 'allowEarlyClosure', label: 'Early close' },
  { key: 'allowPause', label: 'Pause' },
  { key: 'allowRenewal', label: 'Renew' },
] as const;

const PlanCard: React.FC<PlanCardProps> = ({ plan, onEdit, onArchive, onDelete }) => {
  const statusClass = STATUS_COLORS[plan.status] || STATUS_COLORS.active;

  const isExpired = plan.endDate && new Date(plan.endDate) < new Date();
  const hasNotStarted = plan.startDate && new Date(plan.startDate) > new Date();

  return (
    <div className="group relative flex flex-col rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 overflow-hidden">
      {/* Color accent */}
      <div className="h-1 w-full bg-gradient-to-r from-primary/60 to-primary/20" />

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-foreground text-base leading-tight truncate">{plan.name}</div>
            <div className="text-xs font-mono text-muted-foreground">{plan.code}</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs border ${statusClass} capitalize shrink-0`}>
              {isExpired ? 'Expired' : hasNotStarted ? 'Upcoming' : plan.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  ⋮
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {plan.status !== 'archived' && (
                  <DropdownMenuItem onClick={onArchive} className="text-amber-400">
                    <Archive className="h-4 w-4 mr-2" />Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold font-mono text-foreground">
            {formatCurrency(parseFloat(plan.basePrice) || 0)}
          </span>
          <span className="text-sm text-muted-foreground">
            / {BILLING_LABELS[plan.billingCycle] || plan.billingCycle}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Min qty: {plan.minimumQuantity}</span>
            {plan.trialPeriodDays > 0 && (
              <span className="ml-2 text-primary">• {plan.trialPeriodDays}d trial</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {formatDate(plan.startDate)}
              {plan.endDate ? ` → ${formatDate(plan.endDate)}` : ' → No end'}
            </span>
          </div>
          {parseFloat(plan.setupFee) > 0 && (
            <div className="flex items-center gap-1.5 text-amber-400">
              <span>Setup fee: {formatCurrency(parseFloat(plan.setupFee))}</span>
            </div>
          )}
        </div>

        {/* Config flags */}
        <div className="flex flex-wrap gap-2">
          {CONFIG_FLAGS.map(({ key, label }) => {
            const enabled = (plan as any)[key];
            return (
              <span
                key={key}
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${enabled
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  }`}
              >
                {enabled ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                {label}
              </span>
            );
          })}
        </div>

        {/* Products count */}
        {plan.products && plan.products.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {plan.products.length} product{plan.products.length > 1 ? 's' : ''} attached
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        <Button variant="outline" className="w-full" size="sm" onClick={onEdit}>
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Edit Plan
        </Button>
      </div>
    </div>
  );
};

export default AdminPlans;
