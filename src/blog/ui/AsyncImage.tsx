import React, { useEffect, useState } from 'react';
import { MediaService } from '../../services/mediaService';
import { ImageOff, Loader2 } from 'lucide-react';

interface AsyncImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src?: string;
    mediaService?: MediaService;
}

export const AsyncImage: React.FC<AsyncImageProps> = ({ src, alt, mediaService, className, ...props }) => {
    const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!src) {
            setResolvedSrc(null);
            return;
        }

        // Check if src is a slug reference
        if (src.startsWith('slug:') && mediaService) {
            const slug = src.replace('slug:', '');

            const resolveSlug = async () => {
                setLoading(true);
                setError(false);
                try {
                    const mediaItem = await mediaService.getBySlug(slug);

                    if (mediaItem) {
                        setResolvedSrc(mediaItem.url);
                    } else {
                        setError(true);
                    }
                } catch (e) {
                    console.error(`[AsyncImage] Failed to resolve image slug "${slug}"`, e);
                    setError(true);
                } finally {
                    setLoading(false);
                }
            };

            resolveSlug();
        } else {
            setResolvedSrc(src);
        }
    }, [src, mediaService]);

    if (loading) {
        return (
            <span className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded animate-pulse ${className}`} style={{ minHeight: '200px', display: 'flex' }}>
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </span>
        );
    }

    if (error) {
        return (
            <span className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded border border-red-200 dark:border-red-900 ${className}`} style={{ minHeight: '100px', display: 'flex' }}>
                <div className="text-center p-4">
                    <ImageOff className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <span className="text-xs text-red-500">Image not found</span>
                </div>
            </span>
        );
    }

    if (!resolvedSrc) return null;

    return <img src={resolvedSrc} alt={alt} className={className} {...props} />;
};
