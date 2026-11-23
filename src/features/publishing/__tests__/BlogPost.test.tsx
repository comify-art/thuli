import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BlogPostComponent } from '../ui/BlogPost';

vi.mock('../ui/BlogMarkdownRenderer', () => ({
    BlogMarkdownRenderer: ({ content }: { content: string }) => <div>{content}</div>,
}));

describe('BlogPostComponent', () => {
    it('shows loading state instead of "Post not found" while fetching without route state', async () => {
        let resolveFetch!: (value: null) => void;
        const mockService = {
            getPostWithContent: vi.fn(() => new Promise<null>((resolve) => {
                resolveFetch = resolve;
            })),
        } as any;

        // Ensure static fallback also returns empty after service returns null
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            json: async () => [],
        }) as any;

        render(
            <MemoryRouter initialEntries={['/blog/test-post']}>
                <Routes>
                    <Route path="/blog/:id" element={
                        <BlogPostComponent indexUrl="/blog_items/index.json" backLink="/blog" blogService={mockService} />
                    } />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByRole('status', { name: /Loading post/i })).toBeInTheDocument();
        expect(screen.queryByText(/Post not found/i)).not.toBeInTheDocument();

        resolveFetch(null);

        await waitFor(() => {
            expect(screen.getByText(/Post not found/i)).toBeInTheDocument();
        });
    });

    it('renders preview metadata from route state immediately while content is loading', async () => {
        let resolveFetch!: (value: any) => void;
        const mockService = {
            getPostWithContent: vi.fn(() => new Promise((resolve) => {
                resolveFetch = resolve;
            })),
        } as any;

        const statePost = {
            id: 'test-post',
            title: 'Instant Preview Title',
            description: 'Preview description',
            date: '2026-11-22T00:00:00.000Z',
            author: 'Murali',
            markdownUrl: '',
        };

        render(
            <MemoryRouter initialEntries={[{ pathname: '/blog/test-post', state: { post: statePost } }]}>
                <Routes>
                    <Route path="/blog/:id" element={
                        <BlogPostComponent indexUrl="/blog_items/index.json" backLink="/blog" blogService={mockService} />
                    } />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Instant Preview Title')).toBeInTheDocument();
        expect(screen.getByText(/Loading article/i)).toBeInTheDocument();
        expect(screen.queryByText(/Post not found/i)).not.toBeInTheDocument();

        resolveFetch({
            meta: {
                id: 'test-post',
                title: 'Instant Preview Title',
                description: 'Preview description',
                author: 'Murali',
                createdAt: { toDate: () => new Date('2026-11-22T00:00:00.000Z') },
            },
            content: { id: 'test-post', markdown: '# Loaded Body' },
        });

        await waitFor(() => {
            expect(screen.getByText('# Loaded Body')).toBeInTheDocument();
        });
    });
});
