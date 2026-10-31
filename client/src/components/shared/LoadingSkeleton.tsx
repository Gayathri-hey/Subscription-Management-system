import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 5,
  className,
}) => {
  return (
    <div className={cn('w-full rounded-xl border border-border bg-card/60 p-4 space-y-4', className)}>
      {/* Table Header skeleton */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <Skeleton className="h-9 w-64" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid gap-4 py-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`head-${i}`} className="h-4 w-3/4" />
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={`row-${rIdx}`}
            className="grid gap-4 py-3 border-t border-border/40 items-center"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, cIdx) => (
              <Skeleton
                key={`cell-${rIdx}-${cIdx}`}
                className={cn('h-4', cIdx === 0 ? 'w-4/5' : cIdx === columns - 1 ? 'w-16 ml-auto' : 'w-2/3')}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Skeleton className="h-4 w-40" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
};

export interface CardGridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const CardGridSkeleton: React.FC<CardGridSkeletonProps> = ({
  count = 4,
  columns = 4,
  className,
}) => {
  const colClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={cn('grid gap-4', colClass, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-36" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex space-x-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Metric Cards */}
      <CardGridSkeleton count={4} columns={4} />

      {/* Main Charts & Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card/60 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>

        <div className="rounded-xl border border-border bg-card/60 p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity table skeleton */}
      <TableSkeleton rows={4} columns={5} />
    </div>
  );
};

export default {
  Table: TableSkeleton,
  CardGrid: CardGridSkeleton,
  Dashboard: DashboardSkeleton,
};

