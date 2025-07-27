import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from '@tanstack/react-table';
import { Input } from './input';
import { Button } from './button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Skeleton, TableSkeleton } from './skeleton';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  description?: string;
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  onExport?: () => void;
  onRefresh?: () => void;
  pageSize?: number;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title,
  description,
  loading = false,
  searchable = true,
  filterable = true,
  exportable = false,
  onExport,
  onRefresh,
  pageSize = 10,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const totalRows = table.getFilteredRowModel().rows.length;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title || 'Loading...'}</CardTitle>
          {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={pageSize} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {exportable && onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="h-8"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-4">
          {searchable && (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search all columns..."
                  value={globalFilter ?? ''}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              {filterable && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Filter className="h-3 w-3" />
                  <span>{totalRows} results</span>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
            Showing {table.getState().pagination.pageIndex * pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * pageSize,
              totalRows
            )}{' '}
            of {totalRows} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium">Page</span>
              <span className="text-sm">
                {currentPage} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Utility function to create sortable columns
export function createSortableColumn<T>(
  accessorKey: keyof T,
  header: string,
  cell?: (value: any) => React.ReactNode
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: cell ? ({ getValue }) => cell(getValue()) : undefined,
  };
}

// Utility function to create action columns
export function createActionColumn<T>(
  actions: (row: T) => React.ReactNode
): ColumnDef<T> {
  return {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => actions(row.original),
  };
} 