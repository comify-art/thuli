import React, { useEffect, useState } from 'react';
import { Save, Globe, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { BlogAdminService } from '../../services/blogService';
import { MediaService } from '../../services/mediaService';
import { BlogPostMeta, MediaItem } from '../../types/blog';
import { MediaPicker } from '../media/MediaPicker';
import { BlogMarkdownRenderer } from '../ui/BlogMarkdownRenderer';

interface BlogEditorProps {
    postId?: string;
    mediaService: MediaService;
    blogService: BlogAdminService;
    defaultAuthor?: string;
    onClose: () => void;
    onSaveSuccess?: () => void;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({
    postId,
    mediaService,
    blogService,
    defaultAuthor = '',
    onClose,
    onSaveSuccess
}) => {
    const [activeTab, setActiveTab] = useState<'write' | 'settings'>('write');
    const [subTab, setSubTab] = useState<'code' | 'preview'>('code');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [markdown, setMarkdown] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [coverImageThumbnailUrl, setCoverImageThumbnailUrl] = useState('');
    const [coverImageId, setCoverImageId] = useState<string | undefined>(undefined);
    const [author, setAuthor] = useState('');

    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [originalMeta, setOriginalMeta] = useState<BlogPostMeta | null>(null);

    // Initial Load
    useEffect(() => {
        if (postId) {
            loadPost(postId);
        } else {
            setAuthor(defaultAuthor);
        }
    }, [postId, defaultAuthor]);

    const loadPost = async (id: string) => {
        setLoading(true);
        try {
            const data = await blogService.getPostWithContent(id);
            if (data) {
                setOriginalMeta(data.meta);
                setTitle(data.meta.title);
                setSlug(data.meta.slug);
                setDescription(data.meta.description || '');
                setCategory(data.meta.category || '');
                setTags(data.meta.tags ? data.meta.tags.join(', ') : '');
                setCoverImageUrl(data.meta.coverImageUrl || '');
                setCoverImageThumbnailUrl(data.meta.coverImageThumbnailUrl || '');
                setCoverImageId(data.meta.coverImageId);
                setStatus(data.meta.status);
                setAuthor(data.meta.author || '');
                setMarkdown(data.content.markdown || '');
            }
        } catch (e) {
            console.error(e);
            alert("Failed to load post");
        } finally {
            setLoading(false);
        }
    };

    // Media Picker
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const handleMediaSelect = (item: MediaItem) => {
        setCoverImageUrl(item.url);
        setCoverImageThumbnailUrl(item.thumbnailUrl || item.url);
        setCoverImageId(item.id);
    };

    const handleSave = async (targetStatus: 'draft' | 'published') => {
        if (!title || !slug) {
            alert("Title and Slug are required");
            return;
        }

        setSaving(true);
        try {
            const meta: any = {
                id: originalMeta ? originalMeta.id : slug, // Maintain ID if editing, else use slug
                title,
                slug,
                contentId: originalMeta ? originalMeta.contentId : crypto.randomUUID()
            };

            if (description) meta.description = description;
            if (category) meta.category = category;
            if (tags) meta.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
            if (coverImageUrl) meta.coverImageUrl = coverImageUrl;
            if (coverImageThumbnailUrl) meta.coverImageThumbnailUrl = coverImageThumbnailUrl;
            if (coverImageId) meta.coverImageId = coverImageId;
            if (author) meta.author = author;

            if (targetStatus === 'published') {
                await blogService.publish(meta, markdown);
            } else {
                await blogService.saveDraft(meta, markdown);
            }

            if (onSaveSuccess) onSaveSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            alert("Failed to save post");
        } finally {
            setSaving(false);
        }
    };

    const setTitleAndSlug = (title: string) => {
        setTitle(title);
        if (!postId && !slug) {
            setSlug(title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, ''));
        }
    };

    if (loading) return <div className="p-8 text-center admin-text-muted">Loading editor...</div>;

    return (
        <div className="admin-card flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="p-4 border-b admin-border flex justify-between items-center admin-surface-sunken rounded-t-lg">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="admin-btn-icon">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        {/* Title Input as Headline */}
                        <input
                            type="text"
                            className="text-xl font-bold bg-transparent border-none focus:ring-0 outline-none w-full min-w-[300px] admin-text-strong placeholder:opacity-40"
                            placeholder="Enter Post Title..."
                            value={title}
                            onChange={(e) => setTitleAndSlug(e.target.value)}
                        />
                        <div className="text-xs admin-text-muted font-mono pl-1">
                            Slug: {slug}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleSave('draft')}
                        disabled={saving}
                        className="admin-btn-secondary"
                    >
                        <Save className="w-4 h-4" />
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleSave('published')}
                        disabled={saving}
                        className="px-4 py-2 flex items-center gap-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        <Globe className="w-4 h-4" />
                        {status === 'published' ? 'Update' : 'Publish'}
                    </button>
                </div>
            </div>

            {/* Tabs (with Editor/Preview toggle inline on the right when on Write) */}
            <div className="flex items-stretch border-b admin-border" style={{ backgroundColor: 'var(--admin-surface)' }}>
                <button
                    onClick={() => setActiveTab('write')}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'write'
                        ? 'border-blue-400 text-blue-400'
                        : 'border-transparent admin-text-muted hover:opacity-80'
                        }`}
                >
                    Write
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'settings'
                        ? 'border-blue-400 text-blue-400'
                        : 'border-transparent admin-text-muted hover:opacity-80'
                        }`}
                >
                    Settings
                </button>
                {activeTab === 'write' && (
                    <div className="flex items-center pr-3">
                        <div className="admin-pill-track">
                            <button
                                onClick={() => setSubTab('code')}
                                className={`admin-pill ${subTab === 'code' ? 'admin-pill-active' : ''}`}
                            >
                                Editor
                            </button>
                            <button
                                onClick={() => setSubTab('preview')}
                                className={`admin-pill ${subTab === 'preview' ? 'admin-pill-active' : ''}`}
                            >
                                Preview
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'write' && (
                    <div className="h-full flex flex-col">
                        <div className="flex-1 overflow-auto admin-surface-sunken">
                            {subTab === 'code' ? (
                                <textarea
                                    className="w-full h-full p-4 font-mono text-sm resize-none outline-none bg-transparent admin-text-body"
                                    placeholder="Write your story here..."
                                    value={markdown}
                                    onChange={(e) => setMarkdown(e.target.value)}
                                />
                            ) : (
                                <BlogMarkdownRenderer
                                    content={markdown}
                                    mediaService={mediaService}
                                    className="p-8"
                                />
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="p-2 max-w-2xl mx-auto overflow-y-auto h-full space-y-4">
                        <div className="space-y-2">
                            <label className="admin-label">
                                Excerpt (Description)
                            </label>
                            <textarea
                                className="admin-input"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="admin-label">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="admin-label">
                                    Author
                                </label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="admin-label">
                                Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                className="admin-input"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="admin-label">
                                Cover Image
                            </label>

                            {coverImageUrl ? (
                                <div className="relative aspect-video w-full max-w-md admin-surface-sunken rounded overflow-hidden border admin-border">
                                    <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setIsMediaPickerOpen(true)}
                                        className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded text-sm hover:bg-black/90 transition"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsMediaPickerOpen(true)}
                                    className="w-full max-w-md h-40 border-2 border-dashed admin-border rounded-lg flex flex-col items-center justify-center admin-text-muted hover:text-blue-500 hover:border-blue-500 transition"
                                >
                                    <ImageIcon className="w-8 h-8 mb-2" />
                                    <span>Select Cover Image</span>
                                </button>
                            )}
                        </div>

                        <div className="space-y-2 pt-4 border-t admin-border">
                            <label className="admin-label">
                                Slug (URL Path)
                            </label>
                            <input
                                type="text"
                                className="admin-input font-mono text-sm"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            <MediaPicker
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
                service={mediaService}
            />
        </div>
    );
};
