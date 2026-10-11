import { useCallback, useEffect, useState } from 'react';
import type { Page, PageCursor } from '../services/baseService';

export interface UseCursorPaginationOptions<T> {
    /**
     * Fetch one page given a cursor. The hook owns the cursor stack and calls
     * this with `undefined` for the first page, then with the cursors it has
     * walked up to for subsequent pages.
     */
    fetchPage: (cursor: PageCursor | undefined) => Promise<Page<T>>;
    /**
     * Re-initialize (reset to page 1) when any of these change. Pass
     * `[service, pageSize, filter]` etc. — same shape as a React effect dep
     * array.
     */
    deps?: unknown[];
}

export interface CursorPagination<T> {
    items: T[];
    loading: boolean;
    pageIndex: number;
    hasNext: boolean;
    hasPrev: boolean;
    next: () => void;
    prev: () => void;
    /** Refetch the current page in place — use after mutations. */
    reload: () => void;
    /** Drop the stack and refetch from page 1. */
    reset: () => void;
}

/**
 * Cursor-stack pagination — keeps a stack of cursors so the user can walk
 * forward (using each page's `nextCursor`) AND backward without re-fetching
 * every preceding page.
 *
 * Used by `BlogAdminList`, `MediaLibrary`, and the upcoming verse-books
 * admin tables. The hook owns all pagination state; the caller only
 * supplies `fetchPage(cursor)` and the deps that should reset it.
 */
export function useCursorPagination<T>({
    fetchPage,
    deps = [],
}: UseCursorPaginationOptions<T>): CursorPagination<T> {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    // cursorStack[i] is the cursor we passed to fetch page `i`.
    // Index 0 is always `undefined` (first page starts at the beginning).
    const [cursorStack, setCursorStack] = useState<Array<PageCursor | undefined>>([undefined]);
    const [pageIndex, setPageIndex] = useState(0);
    const [hasNext, setHasNext] = useState(false);

    const loadPage = useCallback(
        async (idx: number, stack: Array<PageCursor | undefined>) => {
            setLoading(true);
            try {
                const cursor = stack[idx];
                const page = await fetchPage(cursor);
                setItems(page.items);
                setPageIndex(idx);
                setHasNext(!!page.nextCursor);
                if (page.nextCursor && stack.length === idx + 1) {
                    setCursorStack([...stack, page.nextCursor as PageCursor | undefined]);
                }
            } catch (e) {
                console.error('useCursorPagination fetchPage failed:', e);
                setItems([]);
            } finally {
                setLoading(false);
            }
        },
        [fetchPage],
    );

    const reset = useCallback(() => {
        const fresh: Array<PageCursor | undefined> = [undefined];
        setCursorStack(fresh);
        setPageIndex(0);
        loadPage(0, fresh);
    }, [loadPage]);

    const reload = useCallback(() => {
        loadPage(pageIndex, cursorStack);
    }, [loadPage, pageIndex, cursorStack]);

    const next = useCallback(() => {
        if (hasNext) loadPage(pageIndex + 1, cursorStack);
    }, [hasNext, pageIndex, cursorStack, loadPage]);

    const prev = useCallback(() => {
        if (pageIndex > 0) loadPage(pageIndex - 1, cursorStack);
    }, [pageIndex, cursorStack, loadPage]);

    useEffect(() => {
        reset();
        // Caller-supplied deps drive the reset; including `reset` here would
        // also reset on every render since fetchPage closures change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return {
        items,
        loading,
        pageIndex,
        hasNext,
        hasPrev: pageIndex > 0,
        next,
        prev,
        reload,
        reset,
    };
}
