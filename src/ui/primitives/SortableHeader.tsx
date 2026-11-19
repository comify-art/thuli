import React from 'react';
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortableHeaderProps {
  label: React.ReactNode;
  field?: string;
  currentSortField?: string | null;
  sortDirection?: SortDirection;
  onSort?: (field: string) => void;
  align?: 'left' | 'right' | 'center';
  width?: string;
  className?: string;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  field,
  currentSortField,
  sortDirection,
  onSort,
  align = 'left',
  width = '',
  className = ''
}) => {
  const isSortable = Boolean(field && onSort);
  const isActive = Boolean(field && currentSortField === field && sortDirection);

  const handleClick = () => {
    if (isSortable && field && onSort) {
      onSort(field);
    }
  };

  const alignClass =
    align === 'right'
      ? 'text-right justify-end'
      : align === 'center'
      ? 'text-center justify-center'
      : 'text-left justify-start';

  return (
    <th
      className={`py-3.5 px-3 text-[11px] font-semibold tracking-wider uppercase select-none transition-colors ${
        isActive ? 'text-brand-gold-300' : 'text-neutral-400 hover:text-neutral-200'
      } ${width} ${className}`}
    >
      {isSortable ? (
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 group cursor-pointer focus:outline-none transition-colors ${alignClass}`}
          title={`Sort by ${typeof label === 'string' ? label : 'column'}`}
        >
          <span className="truncate">{label}</span>
          <span className="shrink-0 transition-transform">
            {isActive && sortDirection === 'asc' ? (
              <ChevronUp className="w-3.5 h-3.5 text-brand-gold-400 stroke-[2.5]" />
            ) : isActive && sortDirection === 'desc' ? (
              <ChevronDown className="w-3.5 h-3.5 text-brand-gold-400 stroke-[2.5]" />
            ) : (
              <ChevronsUpDown className="w-3.5 h-3.5 text-neutral-500 opacity-40 group-hover:opacity-80 transition-opacity" />
            )}
          </span>
        </button>
      ) : (
        <div className={`flex items-center ${alignClass}`}>
          <span className="truncate">{label}</span>
        </div>
      )}
    </th>
  );
};

export default SortableHeader;
