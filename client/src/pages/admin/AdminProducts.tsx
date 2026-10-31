import React, { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ProductItem {
  id: string;
  name: string;
  code: string;
  category: string;
  variantsCount: number;
  basePrice: number;
  status: 'ACTIVE' | 'INACTIVE';
  updatedAt: string;
}

const mockProducts: ProductItem[] = [
  {
    id: 'prod_1',
    name: 'Cloud Infrastructure Suite',
    code: 'CIS-001',
    category: 'Cloud Services',
    variantsCount: 3,
    basePrice: 299,
    status: 'ACTIVE',
    updatedAt: '2026-10-12',
  },
  {
    id: 'prod_2',
    name: 'Managed Security & SOC',
    code: 'SEC-104',
    category: 'Cybersecurity',
    variantsCount: 2,
    basePrice: 599,
    status: 'ACTIVE',
    updatedAt: '2026-10-18',
  },
  {
    id: 'prod_3',
    name: 'AI Analytics Copilot',
    code: 'AI-880',
    category: 'Intelligence',
    variantsCount: 4,
    basePrice: 149,
    status: 'ACTIVE',
    updatedAt: '2026-10-25',
  },
  {
    id: 'prod_4',
    name: 'Legacy API Gateway',
    code: 'GW-092',
    category: 'Networking',
    variantsCount: 1,
    basePrice: 89,
    status: 'INACTIVE',
    updatedAt: '2026-08-11',
  },
];

export const AdminProducts: React.FC = () => {
  const [products] = useState<ProductItem[]>(mockProducts);

  const columns: Column<ProductItem>[] = [
    {
      key: 'name',
      header: 'Product Name',
      sortable: true,
      accessor: (row) => (
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{row.name}</div>
            <div className="text-xs font-mono text-muted-foreground">{row.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      accessor: (row) => (
        <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground font-medium">
          {row.category}
        </span>
      ),
    },
    {
      key: 'variantsCount',
      header: 'Variants',
      sortable: true,
      accessor: (row) => (
        <span className="text-sm font-mono">{row.variantsCount} variants</span>
      ),
    },
    {
      key: 'basePrice',
      header: 'Starting From',
      sortable: true,
      accessor: (row) => (
        <span className="font-mono font-semibold text-foreground">
          {formatCurrency(row.basePrice)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'updatedAt',
      header: 'Last Modified',
      sortable: true,
      accessor: (row) => (
        <span className="text-muted-foreground">{formatDate(row.updatedAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Product & Variant Catalog
          </h2>
          <p className="text-sm text-muted-foreground">
            Define core products, add configurable variants, and manage subscription offerings.
          </p>
        </div>

        <Button leftIcon={<Plus className="h-4 w-4" />}>Add Product</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalog Items</CardTitle>
          <CardDescription>
            Configured products available for quotation and subscription binding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={products}
            columns={columns}
            keyExtractor={(p) => p.id}
            searchable={true}
            searchPlaceholder="Search products or SKU codes..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;

