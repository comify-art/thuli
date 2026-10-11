/**
 * interface for share data
 */
export interface ShareData {
    title?: string;
    text?: string;
    url?: string;
}

/**
 * Generic share utility that attempts to use the native OS share API.
 * Fallbacks to clipboard if native share is unavailable or fails.
 * 
 * @param data - The data to share (title, text, url)
 * @param onSuccess - Callback when share/copy is successful
 * @param onError - Callback when share/copy fails
 */
export const shareContent = async (
    data: ShareData,
    onSuccess?: () => void,
    onError?: (error: any) => void
): Promise<void> => {
    try {
        if (navigator.share) {
            await navigator.share(data);
            if (onSuccess) onSuccess();
        } else {
            // Fallback to clipboard
            const textToCopy = [data.title, data.text, data.url].filter(Boolean).join('\n\n');
            await navigator.clipboard.writeText(textToCopy);
            if (onSuccess) onSuccess();
        }
    } catch (error) {
        console.error('Share failed:', error);
        // If native share was aborted by user, we might not want to fallback. 
        // But for other errors, or explicit fallback request, we could try clipboard?
        // Usually, if navigator.share throws (e.g. AbortError), we stop.
        // But if it's "not supported" (handled by line 22 check), we use clipboard.

        if (error instanceof Error && error.name !== 'AbortError') {
            if (onError) onError(error);
        }
    }
};
