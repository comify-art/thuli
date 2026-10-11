import React, { useState } from 'react';
import { BlogAdminService } from '../../services/blogService';
import { MediaService } from '../../services/mediaService';

interface BlogRemediationProps {
    blogService: BlogAdminService;
    mediaService: MediaService;
}

export const BlogRemediation: React.FC<BlogRemediationProps> = ({ blogService, mediaService }) => {
    const [status, setStatus] = useState<string>('Ready to Fix');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const runRemediation = async () => {
        if (!confirm("Start remediation? This will update Firestore data.")) return;

        setStatus('Starting...');
        setLogs([]);

        try {
            await fixMediaSlugsAndBuildMaps();
            await scanAndFixPosts();

            setStatus('Complete!');
            addLog("Done.");
        } catch (e) {
            console.error(e);
            setStatus('Error');
            addLog(`Error: ${(e as Error).message}`);
        }
    };

    // State to hold maps across steps (could be passed, but module scope for simplicity in this component or refs)
    // Actually best to pass them or return them.
    let urlToSlugMap = new Map<string, string>();
    let filenameToSlugMap = new Map<string, string>();

    const fixMediaSlugsAndBuildMaps = async () => {
        addLog("=== Step 1: Checking Media Items ===");
        const allMedia = await mediaService.listMedia();

        for (const media of allMedia) {
            let currentSlug = media.slug;

            // If slug is missing or "undefined" string, fix it
            if (!currentSlug || currentSlug === 'undefined') {
                // Generate from naming convention or Name
                const base = media.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                currentSlug = base || `media-${media.id}`;

                addLog(`Fixing missing slug for media: ${media.name} -> ${currentSlug}`);
                await mediaService.update(media.id, { slug: currentSlug });
            }

            if (media.url) {
                // Map Exact URL
                urlToSlugMap.set(media.url, currentSlug);

                // Map Filename (last part of URL) -- legacy fuzzy matching
                const parts = media.url.split('/');
                const filename = parts[parts.length - 1];
                if (filename) {
                    const decoded = decodeURIComponent(filename);
                    filenameToSlugMap.set(decoded, currentSlug);
                    filenameToSlugMap.set(filename, currentSlug);
                }
            }

            // Map Media Name (Original Filename) - Critical for bulk imported items
            if (media.name) {
                filenameToSlugMap.set(media.name, currentSlug);
                filenameToSlugMap.set(media.name.toLowerCase(), currentSlug);
            }
        }
        addLog(`Indexed ${allMedia.length} media items.`);
    };

    const scanAndFixPosts = async () => {
        addLog("=== Step 2: Scanning Blog Posts ===");
        const posts = await blogService.listPosts();

        for (const postMeta of posts) {
            addLog(`\n\n----------\nChecking Post: "${postMeta.title}" (${postMeta.id})...`);

            const data = await blogService.getPostWithContent(postMeta.id);
            if (!data) {
                addLog(`  -> content not found, skipping.`);
                continue;
            }

            let markdown = data.content.markdown;
            let modified = false;

            addLog(`  -> Content Length: ${markdown ? markdown.length : 0}`);
            if (markdown) addLog(`  -> Snippet: ${markdown.slice(0, 100)}...\n\n`);

            // Regex for markdown images
            const imageRegex = /!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/g;
            let match;

            const replacements: { original: string, newUrl: string }[] = [];

            while ((match = imageRegex.exec(markdown)) !== null) {
                const altText = match[1];
                const url = match[2];

                if (url.startsWith('slug:')) continue; // Already good

                addLog(`  -> Found image URL: "${url}"`);

                // 1. Try Exact Map
                let slug = urlToSlugMap.get(url);

                // 2. Try Normalized (strip common prefixes or leading slahes)
                if (!slug) {
                    // remove leading / or // or /blog_items/images/
                    // Common patterns:
                    // /blog_items/images/foo.png
                    // https://comify.art/blog_items/images/foo.png

                    // Let's rely on FILENAME extraction which is most robust
                    const parts = url.split('/');
                    const filename = parts[parts.length - 1];

                    if (filename) {
                        const decoded = decodeURIComponent(filename);
                        slug = filenameToSlugMap.get(decoded) || filenameToSlugMap.get(filename);

                        if (slug) addLog(`     -> Matched by filename "${filename}" to slug: ${slug}`);
                    }
                }

                if (!slug) {
                    addLog(`     -> No existing media found. Creating new Media Item...`);

                    // Create Media Item
                    const filename = url.split('/').pop() || 'image';
                    const baseSlug = filename.split('.')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    slug = baseSlug;

                    // Uniqueness check
                    // Note: This is an async check in a loop, inefficient but safe enough for remediation tool
                    // We can reuse our local maps to check for collisions we JUST created
                    if (await mediaService.getBySlug(slug) || [...urlToSlugMap.values()].includes(slug)) {
                        slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
                    }

                    await mediaService.addItem({
                        id: `legacy-${slug}-${Date.now()}`,
                        name: altText || filename,
                        url: url, // Preserving the legacy URL as the "source" URL
                        type: 'image',
                        slug: slug,
                        author: 'Remediation',
                    });

                    addLog(`     -> Created Media: ${slug}`);

                    // Update maps
                    urlToSlugMap.set(url, slug);
                    filenameToSlugMap.set(filename, slug);
                } else {
                    addLog(`     -> Found slug: ${slug}`);
                }

                replacements.push({
                    original: url,
                    newUrl: `slug:${slug}`
                });
            }

            // Apply replacements
            for (const rep of replacements) {
                // Robust replace: escape special chars in original url for regex or use split/join
                if (markdown.includes(rep.original)) {
                    // Be careful not to replace partial strings if possible, but URLs are usually unique segments
                    // Using split/join replaces ALL occurrences
                    markdown = markdown.split(rep.original).join(rep.newUrl);
                    modified = true;
                }
            }

            // Fix Cover Image
            let coverImageModified = await blogService.checkAndModifyCoverImage(postMeta, urlToSlugMap, filenameToSlugMap, addLog);

            if (modified || coverImageModified) {
                addLog(`  -> Updating content for post...`);
                if (postMeta.status === 'published') {
                    await blogService.publish(postMeta, markdown);
                } else {
                    await blogService.saveDraft(postMeta, markdown);
                }
                addLog(`  -> Saved.`);
            }
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto admin-card">
            <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Blog Remediation Tool</h2>
            <p className="mb-4 admin-text-body">This tool fixes legacy image URLs and missing slugs.</p>

            <button
                onClick={runRemediation}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-6 transition"
            >
                Run Fix
            </button>

            <div className="admin-surface-sunken p-4 rounded h-96 overflow-y-auto font-mono text-xs whitespace-pre-wrap admin-text-body">
                {logs.map((log, i) => (
                    <div key={i} className="mb-1 border-b admin-border pb-1">
                        {log}
                    </div>
                ))}
                {status !== 'Ready to Fix' && <div className="text-blue-500 dark:text-blue-400 font-bold mt-2">{status}</div>}
            </div>
        </div>
    );
};
