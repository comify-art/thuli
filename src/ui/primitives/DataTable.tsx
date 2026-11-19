import React, { useState, useMemo } from 'react';
import { type LucideIcon, Inbox } from 'lucide-react';
import { SortableHeader, type SortDirection } from './SortableHeader';
import { EmptyState } from './EmptyState';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  field?: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string;
  className?: string;
  render: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  sortField?: string | null;
  sortDirection?: SortDirection;
  onSort?: (field: string) => void;
  onRowClick?: (item: T) => void;
  maxHeight?: string;
  minWidth?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  loadingMessage = 'Loading data...',
  emptyTitle = 'No Records Found',
  emptyDescription = 'There are no items matching your criteria.',
  emptyIcon = Inbox,
  emptyAction,
  sortField: controlledSortField,
  sortDirection: controlledSortDirection,
  onSort: controlledOnSort,
  onRowClick,
  maxHeight,
  minWidth = 'min-w-[640px]',
  className = ''
}: DataTableProps<T>) {
  const [internalSortField, setInternalSortField] = useState<string | null>(null);
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(null);

  const isControlled = controlledOnSort !== undefined;
  const currentSortField = isControlled ? controlledSortField : internalSortField;
  const currentSortDirection = isControlled ? controlledSortDirection : internalSortDirection;

  const handleSort = (field: string) => {
    if (isControlled) {
      controlledOnSort(field);
      return;
    }

    if (internalSortField === field) {
      if (internalSortDirection === 'asc') {
        setInternalSortDirection('desc');
      } else if (internalSortDirection === 'desc') {
        setInternalSortField(null);
        setInternalSortDirection(null);
      } else {
        setInternalSortDirection('asc');
      }
    } else {
      setInternalSortField(field);
      setInternalSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (isControlled || !currentSortField || !currentSortDirection) {
      return data;
    }

    return [...data].sort((a, b) => {
      const valA = (a as Record<string, unknown>)[currentSortField];
      const valB = (b as Record<string, unknown>)[currentSortField];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      const comp = valA < valB ? -1 : 1;
      return currentSortDirection === 'asc' ? comp : -comp;
    });
  }, [data, isControlled, currentSortField, currentSortDirection]);

  if (loading) {
    return (
      <div className={`bg-surface-panel border border-border-default rounded-xl p-12 text-center ${className}`}>
        <div className="w-8 h-8 border-2 border-brand-gold-500/30 border-t-brand-gold-400 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-neutral-400">{loadingMessage}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-surface-panel border border-border-default rounded-xl overflow-hidden shadow-sm ${className}`}
    >
      <div
        className={`overflow-x-auto ${maxHeight ? `overflow-y-auto ${maxHeight}` : ''}`}
      >
        <table className={`w-full text-left text-sm border-separate border-spacing-0 ${minWidth}`}>
          <thead className="sticky top-0 z-20 backdrop-blur-md bg-surface-panel/95">
            <tr>
              {columns.map((col) => {
                const isSortable = col.sortable !== false && Boolean(col.field);
                return (
                  <SortableHeader
                    key={col.key}
                    label={col.header}
                    field={isSortable ? col.field : undefined}
                    currentSortField={currentSortField}
                    sortDirection={currentSortDirection}
                    onSort={isSortable ? handleSort : undefined}
                    align={col.align || 'left'}
                    width={col.width}
                    className={`sticky top-0 z-20 backdrop-blur-md bg-surface-panel/95 border-b border-white/[0.08] ${col.className || ''}`}
                  />
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {sortedData.map((item, index) => {
              const rowKey = keyExtractor(item, index);
              return (
                <tr
                  key={rowKey}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  className={`odd:bg-white/[0.02] hover:bg-white/[0.05] transition-colors duration-150 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => {
                    const alignClass =
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left';

                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 text-neutral-300 ${alignClass} ${col.className || ''}`}
                      >
                        {col.render(item, index)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
