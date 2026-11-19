/**
 * Utility to resize images client-side for optimized thumbnails
 */

export interface ResizeOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0-1 for JPEG quality
}

/**
 * Resize an image file to create an optimized thumbnail
 * @param file Original image file
 * @param options Resize options (defaults to h-48 = 192px height)
 * @returns Promise resolving to resized Blob
 */
export async function resizeImage(
    file: File,
    options: ResizeOptions = {}
): Promise<Blob> {
    const {
        maxWidth,
        maxHeight = 192, // h-48 in Tailwind
        quality = 0.85
    } = options;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
        }

        img.onload = () => {
            let { width, height } = img;

            // Calculate new dimensions maintaining aspect ratio
            if (maxHeight && height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
            if (maxWidth && width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw resized image
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob'));
                    }
                },
                file.type.startsWith('image/png') ? 'image/png' : 'image/jpeg',
                quality
            );
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = URL.createObjectURL(file);
    });
}

/**
 * Create a File object from a Blob with a specific name
 */
export function blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, { type: blob.type });
}
