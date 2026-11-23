export interface MetadataOptions {
    title: string;
    description?: string;
    image?: string;
    siteName?: string;
    type?: string;
    url?: string;
}

/**
 * Updates `document.title` and standard SEO / OpenGraph / Twitter meta tags
 * for dynamic client-side item views.
 */
export function updateMetadata(options: MetadataOptions): void {
    const {
        title,
        description,
        image,
        siteName,
        type = 'article',
        url = typeof window !== 'undefined' ? window.location.href : undefined,
    } = options;

    if (typeof document === 'undefined') return;

    document.title = title;

    const setMeta = (name: string, content: string | undefined, prop = false) => {
        if (!content) return;
        const key = prop ? 'property' : 'name';
        let element = document.querySelector(`meta[${key}="${name}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(key, name);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const absoluteImageUrl = image
        ? (image.startsWith('http') ? image : `${origin}${image.startsWith('/') ? '' : '/'}${image}`)
        : undefined;

    setMeta('description', description);
    setMeta('og:site_name', siteName, true);
    setMeta('og:type', type, true);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:image', absoluteImageUrl, true);
    setMeta('og:url', url, true);
    setMeta('twitter:card', absoluteImageUrl ? 'summary_large_image' : 'summary');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', absoluteImageUrl);
}
