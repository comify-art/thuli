import { describe, it, expect, vi } from 'vitest';
import {
    formatCsvCell,
    buildCsvContent,
    copyCsvToClipboard,
    downloadCsvFile,
} from '../csv';

describe('RFC 4180 CSV Utilities', () => {
    describe('formatCsvCell', () => {
        it('handles null, undefined, and empty string', () => {
            expect(formatCsvCell(null)).toBe('""');
            expect(formatCsvCell(undefined)).toBe('""');
            expect(formatCsvCell('')).toBe('""');
        });

        it('quotes values and escapes embedded double quotes per RFC 4180', () => {
            expect(formatCsvCell('Simple text')).toBe('"Simple text"');
            expect(formatCsvCell('Hello "World"')).toBe('"Hello ""World"""');
            expect(formatCsvCell('Multi\nLine')).toBe('"Multi\nLine"');
            expect(formatCsvCell(12345)).toBe('"12345"');
        });
    });

    describe('buildCsvContent', () => {
        it('generates headers and rows with column accessors', () => {
            interface TestUser {
                id: string;
                name: string;
                amount: number;
            }

            const users: TestUser[] = [
                { id: '1', name: 'Alice, Dr.', amount: 5000 },
                { id: '2', name: 'Bob "The Builder"', amount: 10000 },
            ];

            const columns = [
                { header: 'ID', accessor: (u: TestUser) => u.id },
                { header: 'Full Name', accessor: (u: TestUser) => u.name },
                { header: 'Amount ($)', accessor: (u: TestUser) => u.amount },
            ];

            const csv = buildCsvContent(users, columns);
            const lines = csv.split('\r\n');

            expect(lines[0]).toBe('"ID","Full Name","Amount ($)"');
            expect(lines[1]).toBe('"1","Alice, Dr.","5000"');
            expect(lines[2]).toBe('"2","Bob ""The Builder""","10000"');
        });
    });

    describe('copyCsvToClipboard', () => {
        it('writes to navigator.clipboard', async () => {
            const writeTextMock = vi.fn().mockResolvedValue(undefined);
            Object.assign(navigator, {
                clipboard: { writeText: writeTextMock },
            });

            await copyCsvToClipboard('header1,header2\r\nval1,val2');
            expect(writeTextMock).toHaveBeenCalledWith('header1,header2\r\nval1,val2');
        });
    });

    describe('downloadCsvFile', () => {
        it('triggers anchor download click and revokes object URL', () => {
            const createObjectURLMock = vi.fn().mockReturnValue('blob:test-url');
            const revokeObjectURLMock = vi.fn();
            global.URL.createObjectURL = createObjectURLMock;
            global.URL.revokeObjectURL = revokeObjectURLMock;

            const appendChildSpy = vi.spyOn(document.body, 'appendChild');
            const removeChildSpy = vi.spyOn(document.body, 'removeChild');

            downloadCsvFile('test-export', 'col1,col2');

            expect(createObjectURLMock).toHaveBeenCalledTimes(1);
            expect(appendChildSpy).toHaveBeenCalled();
            expect(removeChildSpy).toHaveBeenCalled();
            expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-url');
        });
    });
});
