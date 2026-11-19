import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { DocumentViewer, PdfViewer } from '../DocumentViewer';

describe('DocumentViewer & PdfViewer Component', () => {
    it('renders empty state when no document src is provided', () => {
        render(
            <DocumentViewer
                emptyTitle="No Pitch Deck Uploaded"
                emptyMessage="Founder has not submitted a deck yet."
            />
        );

        expect(screen.getByText('No Pitch Deck Uploaded')).toBeDefined();
        expect(screen.getByText('Founder has not submitted a deck yet.')).toBeDefined();
    });

    it('renders iframe when a direct http/https URL is passed', () => {
        render(
            <DocumentViewer
                src="https://example.com/pitch-deck.pdf"
                title="Series A Deck"
                companyName="FinTech Inc"
            />
        );

        expect(screen.getByText('FinTech Inc Series A Deck')).toBeDefined();
        expect(screen.getByText('PDF')).toBeDefined();

        const iframe = screen.getByTitle('FinTech Inc Series A Deck');
        expect(iframe).toBeDefined();
        expect(iframe.getAttribute('src')).toBe('https://example.com/pitch-deck.pdf#toolbar=0&navpanes=0');

        const openLink = screen.getByRole('link', { name: /Open in New Tab/i });
        expect(openLink.getAttribute('href')).toBe('https://example.com/pitch-deck.pdf');
    });

    it('handles async resolveUrl and renders resolved content', async () => {
        const mockResolver = vi.fn().mockResolvedValue('https://storage.googleapis.com/bucket/deck.pdf');

        render(
            <DocumentViewer
                src="gs://bucket/deck.pdf"
                title="Pitch Deck"
                resolveUrl={mockResolver}
            />
        );

        // Initially in loading state
        expect(screen.getByText(/Resolving Document.../i)).toBeDefined();

        await waitFor(() => {
            expect(mockResolver).toHaveBeenCalledWith('gs://bucket/deck.pdf');
            expect(screen.queryByText(/Resolving Document.../i)).toBeNull();
        });

        const iframe = screen.getByTitle('Pitch Deck');
        expect(iframe.getAttribute('src')).toContain('https://storage.googleapis.com/bucket/deck.pdf');
    });

    it('renders fallback error notice when resolveUrl rejects', async () => {
        const mockResolver = vi.fn().mockRejectedValue(new Error('Permission denied'));

        render(
            <DocumentViewer
                src="gs://restricted/deck.pdf"
                title="Protected Deck"
                resolveUrl={mockResolver}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Embedded preview not directly available')).toBeDefined();
            expect(screen.getByText('Permission denied')).toBeDefined();
        });
    });

    it('is aliased as PdfViewer', () => {
        render(<PdfViewer emptyTitle="Empty via PdfViewer Alias" />);
        expect(screen.getByText('Empty via PdfViewer Alias')).toBeDefined();
    });
});
