import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Search, X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { plansApi, type PlanPayload } from '@/services/plans.api';
import { productsApi, type Product } from '@/services/products.api';
import { formatCurrency } from '@/lib/utils';

type BillingInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface FormData {
  name: string;
  code: string;
  description: string;
  billingInterval: BillingInterval;
  billingPrice: string;
  currency: string;
  minimumQuantity: string;
  startDate: string;
  endDate: string;
  trialPeriodDays: string;
  setupFee: string;
  status: 'draft' | 'active' | 'archived';
  isPublic: boolean;
  autoClose: boolean;
  allowEarlyClosure: boolean;
  allowPause: boolean;
  allowRenewal: boolean;
}

const DEFAULT_FORM: FormData = {
  name: '', code: '', description: '', billingInterval: 'monthly',
  billingPrice: '', currency: 'USD', minimumQuantity: '1',
  startDate: new Date().toISOString().slice(0, 10), endDate: '',
  trialPeriodDays: '0', setupFee: '0', status: 'active',
  isPublic: true, autoClose: true, allowEarlyClosure: false,
  allowPause: false, allowRenewal: true,
};

interface SelectedProduct {
  product: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPriceOverride: string;
  isOptional: boolean;
  pricingType: 'flat_fee' | 'per_unit';
  sortOrder: number;
}

export const PlanFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Product picker
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      loadPlan(id);
    }
  }, [id, isNew]);

  const loadPlan = async (planId: string) => {
    setLoading(true);
    try {
      const resp = await plansApi.getById(planId);
      const p = resp.data as any;
      setForm({
        name: p.name ?? '',
        code: p.code ?? '',
        description: p.description ?? '',
        billingInterval: (p.billingCycle ?? 'monthly') as BillingInterval,
        billingPrice: p.basePrice ?? '',
        currency: p.currency ?? 'USD',
        minimumQuantity: String(p.minimumQuantity ?? 1),
        startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 10) : '',
        endDate: p.endDate ? new Date(p.endDate).toISOString().slice(0, 10) : '',
        trialPeriodDays: String(p.trialPeriodDays ?? 0),
        setupFee: p.setupFee ?? '0',
        status: p.status ?? 'active',
        isPublic: p.isPublic ?? true,
        autoClose: p.autoClose ?? true,
        allowEarlyClosure: p.allowEarlyClosure ?? false,
        allowPause: p.allowPause ?? false,
        allowRenewal: p.allowRenewal ?? true,
      });

      if (p.products) {
        setSelectedProducts(p.products.map((pp: any) => ({
          product: pp.product?._id || pp.product,
          productName: pp.product?.name || 'Unknown',
          productCode: pp.product?.code || '',
          quantity: pp.quantity ?? 1,
          unitPriceOverride: pp.unitPriceOverride ?? '',
          isOptional: pp.isOptional ?? false,
          pricingType: pp.pricingType ?? 'per_unit',
          sortOrder: pp.sortOrder ?? 0,
        })));
      }
    } catch (e: any) {
      setGlobalError(e?.message || 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (q: string) => {
    setLoadingProducts(true);
    try {
      const resp = await productsApi.list({ search: q, status: 'active', limit: 20 });
      setAvailableProducts((resp.data as any) || []);
    } catch {
      setAvailableProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (productPickerOpen) {
      searchProducts(productSearch);
    }
  }, [productSearch, productPickerOpen]);

  const addProduct = (product: Product) => {
    if (selectedProducts.some((p) => p.product === product._id)) return;
    setSelectedProducts((prev) => [
      ...prev,
      {
        product: product._id,
        productName: product.name,
        productCode: product.code,
        quantity: 1,
        unitPriceOverride: '',
        isOptional: false,
        pricingType: 'per_unit',
        sortOrder: prev.length,
      },
    ]);
    setProductPickerOpen(false);
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.product !== productId));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Plan name is required';
    if (!form.code.trim()) errs.code = 'Plan code is required';
    else if (!/^[A-Z0-9_-]+$/i.test(form.code)) errs.code = 'Code must only contain letters, numbers, underscores, or hyphens';
    if (!form.billingPrice) errs.billingPrice = 'Billing price is required';
    else if (isNaN(parseFloat(form.billingPrice)) || parseFloat(form.billingPrice) < 0) errs.billingPrice = 'Invalid price';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (form.endDate && form.startDate && new Date(form.endDate) < new Date(form.startDate)) {
      errs.endDate = 'End date must be after start date';
    }
    if (!form.minimumQuantity || parseInt(form.minimumQuantity) < 1) errs.minimumQuantity = 'Minimum quantity must be at least 1';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setGlobalError(null);
    setSuccessMessage(null);

    try {
      const payload: PlanPayload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        billingInterval: form.billingInterval,
        billingPrice: parseFloat(form.billingPrice),
        currency: form.currency,
        minimumQuantity: parseInt(form.minimumQuantity),
        startDate: form.startDate,
        endDate: form.endDate || null,
        trialPeriodDays: parseInt(form.trialPeriodDays) || 0,
        setupFee: parseFloat(form.setupFee) || 0,
        status: form.status,
        isPublic: form.isPublic,
        autoClose: form.autoClose,
        allowEarlyClosure: form.allowEarlyClosure,
        allowPause: form.allowPause,
        allowRenewal: form.allowRenewal,
        products: selectedProducts.map((sp) => ({
          product: sp.product,
          quantity: sp.quantity,
          unitPriceOverride: sp.unitPriceOverride ? parseFloat(sp.unitPriceOverride) : undefined,
          isOptional: sp.isOptional,
          pricingType: sp.pricingType,
          sortOrder: sp.sortOrder,
        })),
      };

      if (isNew) {
        const resp = await plansApi.create(payload);
        const newId = (resp.data as any)?._id;
        setSuccessMessage('Plan created!');
        setTimeout(() => navigate(`/admin/plans/${newId}`), 800);
      } else {
        await plansApi.update(id!, payload);
        setSuccessMessage('Plan updated!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (e: any) {
      setGlobalError(e?.message || 'Failed to save plan');
      if (e?.errors) {
        const mapped: Record<string, string> = {};
        e.errors.forEach((err: any) => { if (err.field) mapped[err.field] = err.message; });
        setErrors(mapped);
      }
    } finally {
      setSaving(false);
    }
  };

  const setField = (key: keyof FormData, value: any) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/plans')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {isNew ? 'New Subscription Plan' : `Edit: ${form.name || '...'}`}
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure billing intervals, pricing policies, and attached products.
          </p>
        </div>
        <Button id="save-plan-btn" onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {isNew ? 'Create Plan' : 'Save Changes'}
        </Button>
      </div>

      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">{successMessage}</div>
      )}
      {globalError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">{globalError}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - main form */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="plan-name">Plan Name *</Label>
                <Input
                  id="plan-name"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Professional Monthly"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-code">Plan Code *</Label>
                <Input
                  id="plan-code"
                  value={form.code}
                  onChange={(e) => setField('code', e.target.value.toUpperCase())}
                  placeholder="e.g. PRO-MONTHLY"
                  className={`font-mono ${errors.code ? 'border-destructive' : ''}`}
                />
                {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="plan-desc">Description</Label>
                <Textarea
                  id="plan-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Plan description for customers..."
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Billing Configuration</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label>Billing Interval *</Label>
                <Select value={form.billingInterval} onValueChange={(v: any) => setField('billingInterval', v)}>
                  <SelectTrigger id="billing-interval-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="billing-price">Billing Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    id="billing-price"
                    type="number" min="0" step="0.01"
                    value={form.billingPrice}
                    onChange={(e) => setField('billingPrice', e.target.value)}
                    placeholder="0.00"
                    className={`pl-7 font-mono ${errors.billingPrice ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.billingPrice && <p className="text-xs text-destructive">{errors.billingPrice}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="setup-fee">Setup Fee</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    id="setup-fee"
                    type="number" min="0" step="0.01"
                    value={form.setupFee}
                    onChange={(e) => setField('setupFee', e.target.value)}
                    placeholder="0.00"
                    className="pl-7 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trial-days">Trial Period (days)</Label>
                <Input
                  id="trial-days"
                  type="number" min="0"
                  value={form.trialPeriodDays}
                  onChange={(e) => setField('trialPeriodDays', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="min-qty">Minimum Quantity *</Label>
                <Input
                  id="min-qty"
                  type="number" min="1"
                  value={form.minimumQuantity}
                  onChange={(e) => setField('minimumQuantity', e.target.value)}
                  className={errors.minimumQuantity ? 'border-destructive' : ''}
                />
                {errors.minimumQuantity && <p className="text-xs text-destructive">{errors.minimumQuantity}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Plan Duration</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="start-date">Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setField('startDate', e.target.value)}
                  className={errors.startDate ? 'border-destructive' : ''}
                />
                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-date">End Date <span className="text-muted-foreground">(optional)</span></Label>
                <Input
                  id="end-date"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setField('endDate', e.target.value)}
                  min={form.startDate}
                  className={errors.endDate ? 'border-destructive' : ''}
                />
                {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Attached Products</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setProductPickerOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Attach Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {productPickerOpen && (
                <div className="mb-4 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search active products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {loadingProducts ? (
                      <p className="text-xs text-muted-foreground text-center py-2">Searching...</p>
                    ) : availableProducts.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">No products found</p>
                    ) : availableProducts.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between p-2 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-colors"
                        onClick={() => addProduct(p)}
                      >
                        <div>
                          <div className="text-sm font-medium text-foreground">{p.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{p.code} • {formatCurrency(parseFloat(p.salesPrice) || 0)}</div>
                        </div>
                        {selectedProducts.some(sp => sp.product === p._id) && (
                          <Badge className="text-xs bg-primary/10 text-primary">Added</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setProductPickerOpen(false)}>Close</Button>
                </div>
              )}

              {selectedProducts.length === 0 && !productPickerOpen && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No products attached. Attach products to define what's included in this plan.
                </div>
              )}

              <div className="space-y-2">
                {selectedProducts.map((sp, idx) => (
                  <div key={sp.product} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{sp.productName}</div>
                      <div className="text-xs text-muted-foreground font-mono">{sp.productCode}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number" min="1"
                        value={sp.quantity}
                        onChange={(e) => {
                          const copy = [...selectedProducts];
                          copy[idx].quantity = parseInt(e.target.value) || 1;
                          setSelectedProducts(copy);
                        }}
                        className="w-16 text-center text-xs h-7 font-mono"
                      />
                      <span className="text-xs text-muted-foreground">qty</span>
                    </div>
                    <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sp.isOptional}
                        onChange={(e) => {
                          const copy = [...selectedProducts];
                          copy[idx].isOptional = e.target.checked;
                          setSelectedProducts(copy);
                        }}
                      />
                      Optional
                    </label>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeProduct(sp.product)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - config */}
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Status & Visibility</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="plan-status">Status</Label>
                <Select value={form.status} onValueChange={(v: any) => setField('status', v)}>
                  <SelectTrigger id="plan-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Public Plan</div>
                  <div className="text-xs text-muted-foreground">Visible to customers</div>
                </div>
                <Switch id="is-public" checked={form.isPublic} onCheckedChange={(v) => setField('isPublic', v)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Plan Policies</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'autoClose' as const, label: 'Auto-close at expiry', desc: 'Automatically close when end date is reached' },
                { key: 'allowEarlyClosure' as const, label: 'Allow early closure', desc: 'Customer can cancel before end date' },
                { key: 'allowPause' as const, label: 'Allow pause', desc: 'Customer can pause the subscription' },
                { key: 'allowRenewal' as const, label: 'Allow renewal', desc: 'Customer can renew upon expiry' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{label}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                  <Switch
                    id={`switch-${key}`}
                    checked={form[key]}
                    onCheckedChange={(v) => setField(key, v)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlanFormPage;
