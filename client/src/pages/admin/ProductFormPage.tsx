import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { productsApi, type Product, type ProductVariant } from '@/services/products.api';
import { formatCurrency } from '@/lib/utils';

interface ProductFormData {
  name: string;
  code: string;
  category: string;
  type: string;
  salesPrice: string;
  costPrice: string;
  description: string;
  notes: string;
  status: 'draft' | 'active' | 'archived';
  isRecurring: boolean;
}

const DEFAULT_FORM: ProductFormData = {
  name: '',
  code: '',
  category: '',
  type: 'Service',
  salesPrice: '',
  costPrice: '',
  description: '',
  notes: '',
  status: 'active',
  isRecurring: true,
};

interface VariantFormData {
  name: string;
  value: string;
  priceAdjustment: string;
  status: 'active' | 'inactive' | 'discontinued';
}

const DEFAULT_VARIANT: VariantFormData = {
  name: '', value: '', priceAdjustment: '0', status: 'active',
};

export const ProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState<ProductFormData>(DEFAULT_FORM);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [savedProductId, setSavedProductId] = useState<string | null>(isNew ? null : (id ?? null));

  // Add variant state
  const [variantForm, setVariantForm] = useState<VariantFormData>(DEFAULT_VARIANT);
  const [savingVariant, setSavingVariant] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [variantDialog, setVariantDialog] = useState(false);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew && id) {
      loadProduct(id);
    }
  }, [id, isNew]);

  const loadProduct = async (productId: string) => {
    setLoading(true);
    try {
      const resp = await productsApi.getById(productId);
      const p = resp.data as any;
      setForm({
        name: p.name ?? '',
        code: p.code ?? '',
        category: p.category ?? '',
        type: p.type ?? 'Service',
        salesPrice: p.salesPrice ?? '',
        costPrice: p.costPrice ?? '',
        description: p.description ?? '',
        notes: p.notes ?? '',
        status: p.status ?? 'active',
        isRecurring: p.isRecurring ?? true,
      });
      setVariants(p.variants ?? []);
    } catch (e: any) {
      setGlobalError(e?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    else if (form.name.length < 2) errs.name = 'Product name must be at least 2 characters';
    if (!form.code.trim()) errs.code = 'Product code is required';
    else if (!/^[A-Z0-9_-]+$/i.test(form.code)) errs.code = 'Code must only contain letters, numbers, underscores, or hyphens';
    if (!form.category.trim()) errs.category = 'Category is required';
    if (!form.type.trim()) errs.type = 'Type is required';
    if (!form.salesPrice) errs.salesPrice = 'Sales price is required';
    else if (isNaN(parseFloat(form.salesPrice)) || parseFloat(form.salesPrice) < 0) errs.salesPrice = 'Invalid sales price';
    if (form.costPrice && (isNaN(parseFloat(form.costPrice)) || parseFloat(form.costPrice) < 0)) {
      errs.costPrice = 'Invalid cost price';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setGlobalError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        category: form.category.trim(),
        type: form.type.trim(),
        salesPrice: parseFloat(form.salesPrice),
        costPrice: form.costPrice ? parseFloat(form.costPrice) : undefined,
        description: form.description.trim() || undefined,
        notes: form.notes.trim() || undefined,
        status: form.status,
        isRecurring: form.isRecurring,
      };

      if (isNew) {
        const resp = await productsApi.create(payload);
        const newId = (resp.data as any)?._id;
        setSavedProductId(newId);
        setSuccessMessage('Product created successfully!');
        setTimeout(() => navigate(`/admin/products/${newId}`), 800);
      } else {
        await productsApi.update(id!, payload);
        setSuccessMessage('Product updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (e: any) {
      setGlobalError(e?.message || 'Failed to save product');
      if (e?.errors) {
        const mapped: Record<string, string> = {};
        e.errors.forEach((err: any) => { if (err.field) mapped[err.field] = err.message; });
        setErrors(mapped);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddVariant = async () => {
    if (!variantForm.name.trim() || !variantForm.value.trim()) {
      setVariantError('Variant name and value are required');
      return;
    }
    const productId = savedProductId || id;
    if (!productId) {
      setVariantError('Save the product first before adding variants');
      return;
    }
    setSavingVariant(true);
    setVariantError(null);
    try {
      await productsApi.createVariant(productId, {
        name: variantForm.name.trim(),
        value: variantForm.value.trim(),
        priceAdjustment: parseFloat(variantForm.priceAdjustment) || 0,
        status: variantForm.status,
      });
      setVariantForm(DEFAULT_VARIANT);
      setVariantDialog(false);
      await loadProduct(productId);
    } catch (e: any) {
      setVariantError(e?.message || 'Failed to add variant');
    } finally {
      setSavingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    const productId = savedProductId || id;
    if (!productId) return;
    setDeletingVariantId(variantId);
    try {
      await productsApi.deleteVariant(productId, variantId);
      await loadProduct(productId);
    } catch (e: any) {
      setGlobalError(e?.message || 'Failed to delete variant');
    } finally {
      setDeletingVariantId(null);
    }
  };

  const setField = (key: keyof ProductFormData, value: any) => {
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

  const basePrice = parseFloat(form.salesPrice) || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {isNew ? 'New Product' : `Edit: ${form.name || '...'}`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isNew ? 'Create a new product in your catalog' : 'Update product details and variants'}
          </p>
        </div>
        <Button
          id="save-product-btn"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {isNew ? 'Create Product' : 'Save Changes'}
        </Button>
      </div>

      {/* Success / Error banners */}
      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          {successMessage}
        </div>
      )}
      {globalError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {globalError}
        </div>
      )}

      <Tabs defaultValue="product">
        <TabsList>
          <TabsTrigger value="product">Product Details</TabsTrigger>
          <TabsTrigger value="variants" disabled={isNew && !savedProductId}>
            Variants {variants.length > 0 && `(${variants.length})`}
          </TabsTrigger>
        </TabsList>

        {/* ─── Product Details ────────────────────────────────────────────── */}
        <TabsContent value="product" className="space-y-6 pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="product-name">Product Name *</Label>
                  <Input
                    id="product-name"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="e.g. Cloud Infrastructure Suite"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="product-code">Product Code *</Label>
                  <Input
                    id="product-code"
                    value={form.code}
                    onChange={(e) => setField('code', e.target.value.toUpperCase())}
                    placeholder="e.g. CIS-001"
                    className={`font-mono ${errors.code ? 'border-destructive' : ''}`}
                  />
                  {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="product-category">Category *</Label>
                  <Input
                    id="product-category"
                    value={form.category}
                    onChange={(e) => setField('category', e.target.value)}
                    placeholder="e.g. Cloud Services"
                    className={errors.category ? 'border-destructive' : ''}
                  />
                  {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="product-type">Product Type *</Label>
                  <Select value={form.type} onValueChange={(v) => setField('type', v)}>
                    <SelectTrigger id="product-type" className={errors.type ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Service', 'Software', 'Hardware', 'Subscription', 'Addon', 'License', 'Support', 'Other'].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea
                    id="product-description"
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    rows={3}
                    placeholder="Brief product description..."
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="sales-price">Sales Price (USD) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      id="sales-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.salesPrice}
                      onChange={(e) => setField('salesPrice', e.target.value)}
                      placeholder="0.00"
                      className={`pl-7 font-mono ${errors.salesPrice ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.salesPrice && <p className="text-xs text-destructive">{errors.salesPrice}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cost-price">Cost Price (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      id="cost-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.costPrice}
                      onChange={(e) => setField('costPrice', e.target.value)}
                      placeholder="0.00"
                      className={`pl-7 font-mono ${errors.costPrice ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.costPrice && <p className="text-xs text-destructive">{errors.costPrice}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Options & Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Recurring Product</div>
                    <div className="text-xs text-muted-foreground">Enable for subscription-based billing</div>
                  </div>
                  <Switch
                    id="is-recurring"
                    checked={form.isRecurring}
                    onCheckedChange={(v) => setField('isRecurring', v)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="product-status">Status</Label>
                  <Select value={form.status} onValueChange={(v: any) => setField('status', v)}>
                    <SelectTrigger id="product-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="product-notes">Internal Notes</Label>
                  <Textarea
                    id="product-notes"
                    value={form.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    rows={4}
                    placeholder="Internal notes, procurement details, etc."
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* ─── Variants Tab ────────────────────────────────────────────────── */}
        <TabsContent value="variants" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Product Variants</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Base price: <span className="font-mono font-semibold text-foreground">{formatCurrency(basePrice)}</span>
                    {' '}— Variant price = Base + Adjustment
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setVariantDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Variant Add Form */}
              {variantDialog && (
                <div className="mb-5 p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-4">
                  <div className="text-sm font-semibold text-foreground">New Variant</div>
                  {variantError && (
                    <p className="text-xs text-destructive">{variantError}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Variant Name *</Label>
                      <Input
                        placeholder="e.g. Brand"
                        value={variantForm.name}
                        onChange={(e) => setVariantForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Variant Value *</Label>
                      <Input
                        placeholder="e.g. Odoo"
                        value={variantForm.value}
                        onChange={(e) => setVariantForm(f => ({ ...f, value: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Price Adjustment (USD)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 560"
                          className="pl-7 font-mono"
                          value={variantForm.priceAdjustment}
                          onChange={(e) => setVariantForm(f => ({ ...f, priceAdjustment: e.target.value }))}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Final price: <span className="font-mono text-foreground">
                          {formatCurrency(basePrice + (parseFloat(variantForm.priceAdjustment) || 0))}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label>Status</Label>
                      <Select value={variantForm.status} onValueChange={(v: any) => setVariantForm(f => ({ ...f, status: v }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => { setVariantDialog(false); setVariantError(null); setVariantForm(DEFAULT_VARIANT); }}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddVariant} disabled={savingVariant}>
                      {savingVariant ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                      Add Variant
                    </Button>
                  </div>
                </div>
              )}

              {/* Variants List */}
              {variants.length === 0 && !variantDialog && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No variants added yet.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setVariantDialog(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Add First Variant
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                {variants.map((v) => (
                  <div
                    key={v._id}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-secondary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">{v.name}: <span className="text-primary">{v.value}</span></div>
                        <div className="text-xs text-muted-foreground font-mono">{v.sku}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="font-mono font-semibold text-sm text-foreground">
                          {formatCurrency(parseFloat(v.price) || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {parseFloat(v.priceAdjustment) >= 0 ? '+' : ''}
                          {formatCurrency(parseFloat(v.priceAdjustment) || 0)} adj
                        </div>
                      </div>
                      <Badge className={`text-xs ${v.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400'}`}>
                        {v.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        disabled={deletingVariantId === v._id}
                        onClick={() => handleDeleteVariant(v._id)}
                      >
                        {deletingVariantId === v._id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductFormPage;
