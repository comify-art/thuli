/**
 * RFC 4180 Type-Safe CSV Builder & Exporter
 * 
 * Provides strict RFC 4180 compliant CSV generation, cell escaping,
 * clipboard copying, and browser download triggers.
 */

export interface CsvColumnDef<T> {
    header: string;
    accessor: (item: T) => unknown;
}

/**
 * Quotes and escapes an individual cell value per RFC 4180.
 * 
 * Rules:
 * - null or undefined becomes `""`
 * - Any embedded quotes `"` are escaped as `""`
 * - Wrapped in surrounding double-quotes
 */
export function formatCsvCell(value: unknown): string {
    if (value === null || value === undefined) return '""';
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
}

/**
 * Builds a type-safe CSV content string from an array of records and column definitions.
 * 
 * @example
 * const columns = [
 *   { header: 'Name', accessor: (u: User) => u.name },
 *   { header: 'Email', accessor: (u: User) => u.email }
 * ];
 * const csv = buildCsvContent(users, columns);
 */
export function buildCsvContent<T>(items: T[], columns: CsvColumnDef<T>[]): string {
    const headerRow = columns.map((col) => formatCsvCell(col.header)).join(',');

    const dataRows = items.map((item) =>
        columns.map((col) => formatCsvCell(col.accessor(item))).join(',')
    );

    return [headerRow, ...dataRows].join('\r\n');
}

/**
 * Headless browser CSV file downloader.
 */
export function downloadCsvFile(filename: string, csvContent: string): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const safeFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', safeFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Copies CSV content to clipboard.
 */
export async function copyCsvToClipboard(csvContent: string): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(csvContent);
    }
}
