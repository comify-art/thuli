import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, Download, AlertCircle, Loader2 } from 'lucide-react';

export type DocumentType = 'pdf' | 'presentation' | 'document' | 'auto';

export interface DocumentViewerProps {
    src?: string;
    title?: string;
    companyName?: string;
    fileType?: DocumentType;
    resolveUrl?: (src: string) => Promise<string>;
    height?: string | number;
    downloadable?: boolean;
    openInNewTab?: boolean;
    emptyTitle?: string;
    emptyMessage?: string;
    emptyIcon?: React.ReactNode;
    loadingMessage?: string;
    actions?: React.ReactNode;
    className?: string;
}

/**
 * Headless and styled Document / PDF viewer supporting direct URLs and pluggable
 * async cloud storage resolvers with download fallbacks and error states.
 */
export const DocumentViewer: React.FC<DocumentViewerProps> = ({
    src,
    title = 'Document',
    companyName,
    fileType = 'auto',
    resolveUrl,
    height = 480,
    downloadable = false,
    openInNewTab = true,
    emptyTitle = 'No Document Uploaded',
    emptyMessage = 'No document or pitch deck has been provided.',
    emptyIcon,
    loadingMessage = 'Resolving Document...',
    actions,
    className = '',
}) => {
    const [resolvedUrl, setResolvedUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [resolveError, setResolveError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        if (!src) {
            setResolvedUrl('');
            setLoading(false);
            setResolveError(null);
            return;
        }

        if (resolveUrl) {
            setLoading(true);
            setResolveError(null);
            resolveUrl(src)
                .then((url) => {
                    if (isMounted) {
                        setResolvedUrl(url);
                        setLoading(false);
                    }
                })
                .catch((err) => {
                    if (isMounted) {
                        const msg = err instanceof Error ? err.message : String(err);
                        setResolveError(msg || 'Failed to resolve document storage URL.');
                        setResolvedUrl(src);
                        setLoading(false);
                    }
                });
        } else {
            setResolvedUrl(src);
            setLoading(false);
            setResolveError(null);
        }

        return () => {
            isMounted = false;
        };
    }, [src, resolveUrl]);

    // Format display title
    const displayTitle = companyName ? `${companyName} ${title}` : title;

    // Detect file type
    const isPdf =
        fileType === 'pdf' ||
        (fileType === 'auto' && resolvedUrl.toLowerCase().includes('.pdf'));

    const isPresentation =
        fileType === 'presentation' ||
        (fileType === 'auto' &&
            (resolvedUrl.toLowerCase().includes('.ppt') ||
                resolvedUrl.toLowerCase().includes('.key') ||
                resolvedUrl.toLowerCase().includes('presentation')));

    const typeBadge = isPdf ? 'PDF' : isPresentation ? 'Deck' : 'Doc';

    if (!src) {
        return (
            <div
                className={`flex flex-col items-center justify-center p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center ${className}`}
            >
                {emptyIcon || <FileText className="w-10 h-10 text-neutral-600 mb-3" />}
                <p className="text-sm font-medium text-neutral-400">{emptyTitle}</p>
                <p className="text-xs text-neutral-500 mt-1">{emptyMessage}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div
                className={`flex items-center justify-center p-12 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-neutral-400 gap-3 ${className}`}
            >
                <Loader2 className="w-5 h-5 animate-spin text-brand-gold-400" />
                <span className="text-sm">{loadingMessage}</span>
            </div>
        );
    }

    const isEmbeddable = resolvedUrl.startsWith('http') && !resolveError;
    const resolvedHeight = typeof height === 'number' ? `${height}px` : height;

    return (
        <div
            className={`flex flex-col rounded-2xl bg-neutral-950 border border-neutral-800 overflow-hidden ${className}`}
        >
            {/* Viewer Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/80 border-b border-neutral-800 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-brand-gold-400 shrink-0" />
                    <span className="text-xs font-semibold text-neutral-200 truncate">
                        {displayTitle}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
                        {typeBadge}
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {actions}

                    {downloadable && resolvedUrl.startsWith('http') && (
                        <a
                            href={resolvedUrl}
                            download
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 transition-colors"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Download</span>
                        </a>
                    )}

                    {openInNewTab && resolvedUrl.startsWith('http') && (
                        <a
                            href={resolvedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open in New Tab</span>
                        </a>
                    )}
                </div>
            </div>

            {/* Viewer Frame / Content */}
            <div
                style={{ height: resolvedHeight }}
                className="relative w-full bg-neutral-900/30 flex items-center justify-center"
            >
                {isEmbeddable ? (
                    <iframe
                        src={`${resolvedUrl}#toolbar=0&navpanes=0`}
                        title={displayTitle}
                        className="w-full h-full border-0"
                    />
                ) : (
                    <div className="p-6 text-center max-w-md space-y-3">
                        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                        <p className="text-sm font-medium text-neutral-200">
                            Embedded preview not directly available
                        </p>
                        <p className="text-xs text-neutral-400">
                            {resolveError || 'External document or protected storage link.'}
                        </p>
                        {resolvedUrl.startsWith('http') && (
                            <a
                                href={resolvedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-neutral-900 bg-brand-gold-400 hover:bg-brand-gold-300 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span>Open Document URL</span>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const PdfViewer = DocumentViewer;

export default DocumentViewer;
