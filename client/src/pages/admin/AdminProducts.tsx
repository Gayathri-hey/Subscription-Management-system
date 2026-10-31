import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Plus, Search, Filter, Archive, Trash2, Edit, Eye,
  ChevronDown, RefreshCw, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { productsApi, type Product } from '@/services/products.api';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  draft: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  archived: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export const AdminProducts: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'archive' | 'delete';
    product?: Product;
  }>({ open: false, type: 'archive' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await productsApi.list({
        page,
        limit: 12,
        search: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setProducts((resp.data as any) || []);
      setTotalPages((resp as any).meta?.totalPages ?? 1);
      setTotal((resp as any).meta?.total ?? 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleArchive = async () => {
    if (!confirmDialog.product) return;
    setActionLoading(true);
    try {
      await productsApi.archive(confirmDialog.product._id);
      setConfirmDialog({ open: false, type: 'archive' });
      fetchProducts();
    } catch (e: any) {
      setError(e?.message || 'Archive failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDialog.product) return;
    setActionLoading(true);
    try {
      await productsApi.delete(confirmDialog.product._id);
      setConfirmDialog({ open: false, type: 'delete' });
      fetchProducts();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setPage(1);
  };

  const hasFilters = search || statusFilter || categoryFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Product Catalog
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage products, variants, and pricing for subscriptions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
            className="hidden sm:flex"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            id="add-product-btn"
            onClick={() => navigate('/admin/products/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: total, color: 'text-primary' },
          {
            label: 'Active', value: products.filter(p => p.status === 'active').length,
            color: 'text-emerald-400',
          },
          {
            label: 'Draft', value: products.filter(p => p.status === 'draft').length,
            color: 'text-amber-400',
          },
          {
            label: 'Archived', value: products.filter(p => p.status === 'archived').length,
            color: 'text-slate-400',
          },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
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
                id="product-search"
                placeholder="Search products, codes..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter || 'all'} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-[140px]" id="status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingSkeleton key={i} variant="card" className="h-48" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && (
            <EmptyState
              icon={<Package className="h-12 w-12" />}
              title="No products found"
              description={hasFilters ? 'Try adjusting your filters.' : 'Create your first product to get started.'}
              action={
                !hasFilters ? (
                  <Button onClick={() => navigate('/admin/products/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                ) : (
                  <Button variant="outline" onClick={resetFilters}>Clear Filters</Button>
                )
              }
            />
          )}

          {/* Product Grid */}
          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onEdit={() => navigate(`/admin/products/${product._id}`)}
                  onView={() => navigate(`/admin/products/${product._id}`)}
                  onArchive={() => setConfirmDialog({ open: true, type: 'archive', product })}
                  onDelete={() => setConfirmDialog({ open: true, type: 'delete', product })}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline" size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={confirmDialog.open && confirmDialog.type === 'archive'}
        onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
        title="Archive Product"
        description={`Are you sure you want to archive "${confirmDialog.product?.name}"? It will no longer be available for new subscriptions.`}
        confirmLabel="Archive"
        onConfirm={handleArchive}
        isLoading={actionLoading}
        variant="warning"
      />
      <ConfirmationDialog
        open={confirmDialog.open && confirmDialog.type === 'delete'}
        onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
        title="Delete Product"
        description={`Are you sure you want to permanently delete "${confirmDialog.product?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={actionLoading}
        variant="danger"
      />
    </div>
  );
};

// ─── Product Card Component ────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onView: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onView, onArchive, onDelete }) => {
  const statusClass = STATUS_COLORS[product.status] || STATUS_COLORS.active;

  return (
    <div className="group relative rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 p-5 flex flex-col gap-4">
      {/* Top Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-foreground text-sm leading-tight truncate">{product.name}</div>
            <div className="text-xs font-mono text-muted-foreground">{product.code}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs border ${statusClass} capitalize`}>
            {product.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {product.status !== 'archived' && (
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

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Type</span>
          <span className="text-foreground font-medium">{product.type || '—'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Category</span>
          <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs font-medium">
            {product.category}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Sales Price</span>
          <span className="font-mono font-semibold text-foreground">
            {formatCurrency(parseFloat(product.salesPrice) || 0)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Variants</span>
          <span className="text-muted-foreground">{product.variantsCount ?? 0}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{formatDate(product.updatedAt)}</span>
        <Button size="sm" variant="outline" onClick={onEdit} className="h-7 text-xs">
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </div>
    </div>
  );
};

export default AdminProducts;
