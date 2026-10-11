import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationFooterProps {
    pageIndex: number;
    itemsOnPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    loading: boolean;
    onPrev: () => void;
    onNext: () => void;
    /** Singular form, e.g. `'post'`, `'verse'`, `'item'`. Defaults to `'item'`. */
    itemNoun?: string;
    /** Plural form. Defaults to `<itemNoun>s`. */
    itemNounPlural?: string;
}

/**
 * Prev / Next chevron pair + "Page N — showing M items" caption.
 *
 * Stateless — pair it with `useCursorPagination` (or any equivalent) and
 * wrap in your own container for table-footer vs floating-row styling.
 */
export const PaginationFooter: React.FC<PaginationFooterProps> = ({
    pageIndex,
    itemsOnPage,
    hasNext,
    hasPrev,
    loading,
    onPrev,
    onNext,
    itemNoun = 'item',
    itemNounPlural,
}) => {
    const plural = itemNounPlural || `${itemNoun}s`;
    return (
        <div className="flex items-center justify-between gap-4 text-sm admin-text-body">
            <span>
                {itemsOnPage > 0 ? (
                    <>
                        Page {pageIndex + 1} — showing {itemsOnPage}{' '}
                        {itemsOnPage === 1 ? itemNoun : plural}
                    </>
                ) : (
                    <>No {plural} to show</>
                )}
            </span>
            <div className="flex items-center gap-2">
                <button
                    onClick={onPrev}
                    disabled={!hasPrev || loading}
                    className="admin-btn-secondary"
                    title="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                    onClick={onNext}
                    disabled={!hasNext || loading}
                    className="admin-btn-secondary"
                    title="Next page"
                >
                    Next <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
