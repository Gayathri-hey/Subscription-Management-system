import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  actions?: React.ReactNode;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends object>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchKeys,
  pageSizeOptions = [5, 10, 25, 50],
  defaultPageSize = 10,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records to display at this time.',
  onRowClick,
  actions,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const lower = searchQuery.toLowerCase().trim();

    return data.filter((item) => {
      if (searchKeys && searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const val = item[k];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(lower);
        });
      }

      // Default: inspect all string/number fields of the object
      return Object.values(item).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(lower);
        }
        return false;
      });
    });
  }, [data, searchQuery, searchKeys]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();

      if (sortDirection === 'asc') {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination calculation
  const totalRecords = sortedData.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = useMemo(() => {
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, startIndex, pageSize]);

  const handleSort = (columnKey: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey !== columnKey) {
      setSortKey(columnKey);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortKey(null);
      setSortDirection(null);
    }
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (isLoading) {
    return <TableSkeleton rows={pageSize} columns={columns.length} className={className} />;
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Top Toolbar */}
      {(searchable || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {searchable && (
            <div className="relative w-full sm:w-80">
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                leftAdornment={<Search className="h-4 w-4" />}
                rightAdornment={
                  searchQuery ? (
                    <button
                      onClick={clearSearch}
                      className="p-1 hover:text-foreground text-muted-foreground transition-colors"
                      title="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : undefined
                }
              />
            </div>
          )}

          {actions && <div className="flex items-center space-x-2 self-end sm:self-auto">{actions}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-xl border border-border bg-card/70 overflow-hidden shadow-sm backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            {/* Table Header */}
            <thead className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
              <tr>
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key, col.sortable)}
                      style={{ width: col.width }}
                      className={cn(
                        'px-4 py-3.5 transition-colors',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                        col.sortable && 'cursor-pointer hover:bg-muted/60 hover:text-foreground',
                        col.className
                      )}
                    >
                      <div
                        className={cn(
                          'inline-flex items-center gap-1.5',
                          col.align === 'right' && 'justify-end',
                          col.align === 'center' && 'justify-center'
                        )}
                      >
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="text-muted-foreground">
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ChevronUp className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5 text-primary" />
                              )
                            ) : (
                              <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-border/60">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center">
                    <EmptyState
                      title={searchQuery ? 'No matching records' : emptyTitle}
                      description={
                        searchQuery
                          ? `No records found matching "${searchQuery}".`
                          : emptyDescription
                      }
                      bordered={false}
                    />
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const key = keyExtractor(item);
                  const record = item as Record<string, unknown>;
                  return (
                    <tr
                      key={key}
                      onClick={() => onRowClick && onRowClick(item)}
                      className={cn(
                        'transition-colors hover:bg-muted/30',
                        onRowClick && 'cursor-pointer'
                      )}
                    >
                      {columns.map((col) => {
                        const content = col.accessor
                          ? col.accessor(item)
                          : (record[col.key] as React.ReactNode);

                        return (
                          <td
                            key={col.key}
                            className={cn(
                              'px-4 py-3 text-sm whitespace-nowrap',
                              col.align === 'right' && 'text-right',
                              col.align === 'center' && 'text-center',
                              col.className
                            )}
                          >
                            {content ?? '-'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalRecords > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/15 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 rounded border border-border bg-card px-2 py-0 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="hidden sm:inline pl-2">
                Showing{' '}
                <strong className="text-foreground">
                  {Math.min(startIndex + 1, totalRecords)}
                </strong>{' '}
                to{' '}
                <strong className="text-foreground">
                  {Math.min(startIndex + pageSize, totalRecords)}
                </strong>{' '}
                of <strong className="text-foreground">{totalRecords}</strong> results
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  aria-label="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
