import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Plus, RefreshCw, AlertCircle, Search, Edit,
  ToggleLeft, ToggleRight, Loader2, Save, X, Calculator,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { taxesApi, type TaxRule, type TaxRulePayload } from '@/services/taxes.api';
import { formatDate } from '@/lib/utils';

// ─── Status Config ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  deprecated: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const TAX_TYPE_LABELS: Record<string, string> = {
  sales_tax: 'Sales Tax',
  vat: 'VAT',
  gst: 'GST',
  custom: 'Custom',
};

// ─── Empty Form ────────────────────────────────────────────────────────────────

const emptyForm = (): TaxRulePayload => ({
  name: '',
  code: '',
  taxType: 'vat',
  rate: 0,
  country: '',
  state: '',
  postalCode: '',
  isCompound: false,
  isInclusive: false,
  status: 'active',
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveUntil: null,
});

// ─── Admin Taxes Page ──────────────────────────────────────────────────────────

export const AdminTaxes: React.FC = () => {
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Form dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null);
  const [form, setForm] = useState<TaxRulePayload>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Calculate dialog
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcAmount, setCalcAmount] = useState('');
  const [calcRuleId, setCalcRuleId] = useState('');
  const [calcQty, setCalcQty] = useState('1');
  const [calcResult, setCalcResult] = useState<any>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchTaxRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await taxesApi.list({
        page,
        limit: 15,
        search: search || undefined,
        status: statusFilter || undefined,
        taxType: typeFilter || undefined,
      });
      setTaxRules((resp.data as any) || []);
      setTotalPages((resp as any).meta?.totalPages ?? 1);
      setTotal((resp as any).meta?.total ?? 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load tax rules');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchTaxRules, 300);
    return () => clearTimeout(timer);
  }, [fetchTaxRules]);

  // ─── Dialog Helpers ────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingRule(null);
    setForm(emptyForm());
    setFormErrors({});
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (rule: TaxRule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      code: rule.code,
      taxType: rule.taxType,
      rate: parseFloat(rule.rate),
      country: rule.country,
      state: rule.state ?? '',
      postalCode: rule.postalCode ?? '',
      isCompound: rule.isCompound,
      isInclusive: rule.isInclusive,
      status: rule.status,
      effectiveFrom: rule.effectiveFrom ? new Date(rule.effectiveFrom).toISOString().slice(0, 10) : '',
      effectiveUntil: rule.effectiveUntil ? new Date(rule.effectiveUntil).toISOString().slice(0, 10) : null,
    });
    setFormErrors({});
    setFormError(null);
    setDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.code.trim()) errs.code = 'Code is required';
    else if (!/^[A-Z0-9_-]+$/i.test(form.code)) errs.code = 'Invalid code format';
    if (form.rate < 0 || form.rate > 100) errs.rate = 'Rate must be between 0 and 100';
    if (!form.country.trim() || form.country.length !== 2) errs.country = 'Must be a 2-letter ISO country code';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    setFormError(null);
    try {
      const payload: TaxRulePayload = {
        ...form,
        code: form.code.toUpperCase(),
        country: form.country.toUpperCase(),
        state: form.state?.toUpperCase() || undefined,
        effectiveUntil: form.effectiveUntil || null,
      };
      if (editingRule) {
        await taxesApi.update(editingRule._id, payload);
      } else {
        await taxesApi.create(payload);
      }
      setDialogOpen(false);
      fetchTaxRules();
    } catch (e: any) {
      setFormError(e?.message || 'Failed to save tax rule');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (rule: TaxRule) => {
    const next = rule.status === 'active' ? 'inactive' : 'active';
    setTogglingId(rule._id);
    try {
      await taxesApi.toggleStatus(rule._id, next);
      fetchTaxRules();
    } catch (e: any) {
      setError(e?.message || 'Failed to toggle status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleCalculate = async () => {
    if (!calcAmount || !calcRuleId) {
      setCalcError('Amount and tax rule are required');
      return;
    }
    setCalcLoading(true);
    setCalcError(null);
    setCalcResult(null);
    try {
      const resp = await taxesApi.calculate(parseFloat(calcAmount), calcRuleId, parseInt(calcQty) || 1);
      setCalcResult(resp.data);
    } catch (e: any) {
      setCalcError(e?.message || 'Calculation failed');
    } finally {
      setCalcLoading(false);
    }
  };

  const hasFilters = search || statusFilter || typeFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Tax Rules</h2>
          <p className="text-sm text-muted-foreground">
            Configure tax percentages for products and subscription plans.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            id="tax-calculator-btn"
            variant="outline"
            onClick={() => { setCalcOpen(true); setCalcResult(null); setCalcError(null); }}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculator
          </Button>
          <Button variant="outline" size="sm" onClick={fetchTaxRules} className="hidden sm:flex">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button id="create-tax-btn" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tax Rule
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Rules', value: total },
          { label: 'Active', value: taxRules.filter(t => t.status === 'active').length },
          { label: 'Inactive', value: taxRules.filter(t => t.status === 'inactive').length },
          { label: 'Deprecated', value: taxRules.filter(t => t.status === 'deprecated').length },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="text-2xl font-bold font-mono text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="tax-search"
                placeholder="Search by name, code, country..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter || 'all'} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-[140px]" id="tax-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter || 'all'} onValueChange={(v) => { setTypeFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-[140px]" id="tax-type-filter">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vat">VAT</SelectItem>
                <SelectItem value="gst">GST</SelectItem>
                <SelectItem value="sales_tax">Sales Tax</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); setPage(1); }}>
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

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <LoadingSkeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : taxRules.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="h-12 w-12" />}
              title="No tax rules found"
              description={hasFilters ? 'Try clearing filters.' : 'Add your first tax rule to get started.'}
              action={
                !hasFilters
                  ? <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Tax Rule</Button>
                  : <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); }}>Clear Filters</Button>
              }
            />
          ) : (
            <div className="rounded-xl border border-border/60 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-muted/30 text-xs text-muted-foreground font-semibold uppercase tracking-wider border-b border-border/60">
                <div>Tax Rule</div>
                <div>Type</div>
                <div>Rate</div>
                <div>Region</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {/* Table rows */}
              <div className="divide-y divide-border/50">
                {taxRules.map((rule) => (
                  <div
                    key={rule._id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-4 items-center hover:bg-muted/20 transition-colors"
                  >
                    {/* Name & Code */}
                    <div>
                      <div className="font-medium text-sm text-foreground flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                        {rule.name}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground mt-0.5">{rule.code}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {rule.isInclusive && <span className="mr-2 text-blue-400">Inclusive</span>}
                        {rule.isCompound && <span className="text-purple-400">Compound</span>}
                      </div>
                    </div>

                    {/* Type */}
                    <div>
                      <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground font-medium">
                        {TAX_TYPE_LABELS[rule.taxType] ?? rule.taxType}
                      </span>
                    </div>

                    {/* Rate */}
                    <div className="font-mono font-semibold text-foreground">
                      {parseFloat(rule.rate).toFixed(2)}%
                    </div>

                    {/* Region */}
                    <div className="text-sm text-muted-foreground">
                      <div>{rule.country}{rule.state ? ` / ${rule.state}` : ''}</div>
                      {rule.effectiveUntil && (
                        <div className="text-xs text-amber-400">Exp: {formatDate(rule.effectiveUntil)}</div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div>
                      <Badge className={`text-xs border ${STATUS_COLORS[rule.status] || ''} capitalize`}>
                        {rule.status}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        id={`edit-tax-${rule._id}`}
                        variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => openEdit(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        id={`toggle-tax-${rule._id}`}
                        variant="ghost" size="icon" className="h-8 w-8"
                        disabled={togglingId === rule._id}
                        onClick={() => handleToggleStatus(rule)}
                        title={rule.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {togglingId === rule._id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : rule.status === 'active'
                            ? <ToggleRight className="h-4 w-4 text-emerald-400" />
                            : <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        }
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
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

      {/* ─── Create/Edit Dialog ──────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Tax Rule' : 'New Tax Rule'}</DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{formError}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="tax-name">Name *</Label>
              <Input
                id="tax-name"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. India GST 18%"
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tax-code">Code *</Label>
              <Input
                id="tax-code"
                value={form.code}
                onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. IN-GST-18"
                className={`font-mono ${formErrors.code ? 'border-destructive' : ''}`}
              />
              {formErrors.code && <p className="text-xs text-destructive">{formErrors.code}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Tax Type *</Label>
              <Select value={form.taxType} onValueChange={(v: any) => setForm(f => ({ ...f, taxType: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vat">VAT</SelectItem>
                  <SelectItem value="gst">GST</SelectItem>
                  <SelectItem value="sales_tax">Sales Tax</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tax-rate">Rate (%) *</Label>
              <Input
                id="tax-rate"
                type="number" min="0" max="100" step="0.01"
                value={form.rate}
                onChange={(e) => setForm(f => ({ ...f, rate: parseFloat(e.target.value) || 0 }))}
                className={`font-mono ${formErrors.rate ? 'border-destructive' : ''}`}
              />
              {formErrors.rate && <p className="text-xs text-destructive">{formErrors.rate}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tax-country">Country Code *</Label>
              <Input
                id="tax-country"
                value={form.country}
                onChange={(e) => setForm(f => ({ ...f, country: e.target.value.toUpperCase() }))}
                placeholder="e.g. IN"
                maxLength={2}
                className={`uppercase font-mono ${formErrors.country ? 'border-destructive' : ''}`}
              />
              {formErrors.country && <p className="text-xs text-destructive">{formErrors.country}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tax-state">State / Region</Label>
              <Input
                id="tax-state"
                value={form.state ?? ''}
                onChange={(e) => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))}
                placeholder="e.g. KA (optional)"
                className="uppercase font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tax-from">Effective From</Label>
              <Input
                id="tax-from"
                type="date"
                value={form.effectiveFrom ? String(form.effectiveFrom).slice(0, 10) : ''}
                onChange={(e) => setForm(f => ({ ...f, effectiveFrom: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tax-until">Effective Until</Label>
              <Input
                id="tax-until"
                type="date"
                value={form.effectiveUntil ? String(form.effectiveUntil).slice(0, 10) : ''}
                onChange={(e) => setForm(f => ({ ...f, effectiveUntil: e.target.value || null }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status ?? 'active'} onValueChange={(v: any) => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 sm:col-span-2 border border-border/60 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Tax-Inclusive Price</div>
                  <div className="text-xs text-muted-foreground">Tax is already included in the displayed price</div>
                </div>
                <Switch
                  id="is-inclusive"
                  checked={form.isInclusive}
                  onCheckedChange={(v) => setForm(f => ({ ...f, isInclusive: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Compound Tax</div>
                  <div className="text-xs text-muted-foreground">Tax calculated on top of other taxes</div>
                </div>
                <Switch
                  id="is-compound"
                  checked={form.isCompound}
                  onCheckedChange={(v) => setForm(f => ({ ...f, isCompound: v }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button id="save-tax-rule-btn" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {editingRule ? 'Save Changes' : 'Create Tax Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Tax Calculator Dialog ───────────────────────────────────────────── */}
      <Dialog open={calcOpen} onOpenChange={setCalcOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Tax Calculator
            </DialogTitle>
          </DialogHeader>

          {calcError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{calcError}</div>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Tax Rule</Label>
              <Select value={calcRuleId} onValueChange={setCalcRuleId}>
                <SelectTrigger id="calc-rule-select">
                  <SelectValue placeholder="Select a tax rule..." />
                </SelectTrigger>
                <SelectContent>
                  {taxRules.filter(t => t.status === 'active').map(r => (
                    <SelectItem key={r._id} value={r._id}>
                      {r.name} ({parseFloat(r.rate).toFixed(2)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="calc-amount">Unit Price (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    id="calc-amount"
                    type="number" min="0" step="0.01"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(e.target.value)}
                    className="pl-7 font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="calc-qty">Quantity</Label>
                <Input
                  id="calc-qty"
                  type="number" min="1"
                  value={calcQty}
                  onChange={(e) => setCalcQty(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>

            <Button
              id="calc-submit-btn"
              className="w-full"
              onClick={handleCalculate}
              disabled={calcLoading}
            >
              {calcLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calculator className="h-4 w-4 mr-2" />}
              Calculate
            </Button>

            {calcResult && (
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Calculation Result — {calcResult.taxRuleName}
                </div>
                <div className="divide-y divide-border/50">
                  {[
                    { label: 'Base Amount', value: `$${calcResult.baseAmount}`, bold: false },
                    { label: `Tax (${parseFloat(calcResult.ratePercentage).toFixed(2)}%)`, value: `$${calcResult.taxAmount}`, bold: false },
                    { label: 'Total Amount', value: `$${calcResult.totalAmount}`, bold: true },
                  ].map(({ label, value, bold }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-3">
                      <span className={`text-sm ${bold ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                      <span className={`font-mono text-sm ${bold ? 'text-lg font-bold text-primary' : 'text-foreground'}`}>{value}</span>
                    </div>
                  ))}
                  <div className="px-4 py-2 text-xs text-muted-foreground">
                    {calcResult.isInclusive ? '✓ Tax-inclusive pricing' : '+ Tax added on top'}
                    {calcResult.isCompound && ' • Compound tax applied'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setCalcOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTaxes;
