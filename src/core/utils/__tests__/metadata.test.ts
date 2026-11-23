import { describe, it, expect, beforeEach } from 'vitest';
import { updateMetadata } from '../metadata';

describe('updateMetadata', () => {
    beforeEach(() => {
        document.title = '';
        document.head.innerHTML = '';
    });

    it('sets document.title and OpenGraph / Twitter meta tags', () => {
        updateMetadata({
            title: 'Poem Title | Comify.art',
            description: 'A sample poem description',
            image: '/poems/images/sample.jpg',
            siteName: 'Comify.art',
        });

        expect(document.title).toBe('Poem Title | Comify.art');
        expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('A sample poem description');
        expect(document.querySelector('meta[property="og:site_name"]')?.getAttribute('content')).toBe('Comify.art');
        expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('Poem Title | Comify.art');
        expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toContain('/poems/images/sample.jpg');
        expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');
    });

    it('uses summary twitter card when no image is provided', () => {
        updateMetadata({ title: 'No Image Page' });
        expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary');
        expect(document.querySelector('meta[property="og:image"]')).toBeNull();
    });
});
