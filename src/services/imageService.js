/**
 * Secure Image Upload Service
 * Uses backend pre-signed URLs instead of direct AWS SDK
 * This keeps AWS credentials secure on the backend
 */

// Use relative URL in development (proxy), absolute in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Get pre-signed URL from backend for secure S3 upload
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} - Pre-signed URL data
 */
const getPresignedUrl = async (file) => {
    const response = await fetch(`${API_BASE_URL}/upload/presigned-url`, {
        method: 'POST',
        credentials: 'include', // Important: sends auth cookies
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            fileSize: file.size,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get upload URL');
    }

    const { data } = await response.json();
    return data;
};

/**
 * Upload file directly to S3 using pre-signed URL
 * @param {string} presignedUrl - Pre-signed URL from backend
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Optional progress callback
 */
const uploadToS3 = async (presignedUrl, file, onProgress) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        if (onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentage = Math.round((e.loaded / e.total) * 100);
                    onProgress(percentage);
                }
            });
        }

        xhr.addEventListener('load', () => {
            console.log('S3 Upload Response Status:', xhr.status);
            console.log('S3 Upload Response:', xhr.responseText);

            if (xhr.status === 200) {
                resolve();
            } else {
                reject(new Error(`S3 upload failed with status ${xhr.status}: ${xhr.responseText || 'No error details'}`));
            }
        });

        xhr.addEventListener('error', (e) => {
            console.error('S3 Upload XHR Error Event:', e);
            console.error('Presigned URL:', presignedUrl);
            console.error('File type:', file.type);
            console.error('File size:', file.size);
            reject(new Error('Network error during S3 upload. Check console for details.'));
        });

        xhr.addEventListener('abort', () => {
            reject(new Error('Upload was aborted'));
        });

        console.log('Uploading to S3...');
        console.log('Presigned URL:', presignedUrl.substring(0, 100) + '...');
        console.log('File:', file.name, file.type, file.size);

        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
    });
};

/**
 * Validate image file before upload
 * @param {File} file - File to validate
 * @throws {Error} - If validation fails
 */
const validateImage = (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error('File size exceeds 5MB limit');
    }

    // Validate file name
    if (!file.name || file.name.length > 255) {
        throw new Error('Invalid file name');
    }
};

/**
 * Upload a single image securely through backend
 * @param {File} file - Image file to upload
 * @param {Function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<string>} - S3 URL of uploaded image
 */
export const uploadImage = async (file, onProgress) => {
    try {
        // Validate file
        validateImage(file);

        // Get pre-signed URL from backend
        const { uploadUrl, imageUrl } = await getPresignedUrl(file);

        // Upload directly to S3
        await uploadToS3(uploadUrl, file, onProgress);

        // Return the final image URL
        return imageUrl;
    } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
    }
};

/**
 * Upload multiple images with progress tracking
 * @param {File[]} files - Array of image files (max 10)
 * @param {Function} onProgress - Progress callback with detailed info
 * @returns {Promise<string[]>} - Array of S3 URLs
 */
export const uploadMultipleImages = async (files, onProgress) => {
    if (!files || files.length === 0) {
        throw new Error('No files provided');
    }

    if (files.length > 10) {
        throw new Error('Maximum 10 images allowed');
    }

    const uploadedUrls = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
            // Report file progress
            if (onProgress) {
                onProgress({
                    current: i + 1,
                    total: totalFiles,
                    percentage: 0,
                    filename: file.name,
                    status: 'uploading',
                });
            }

            // Upload with individual file progress
            const url = await uploadImage(file, (fileProgress) => {
                if (onProgress) {
                    onProgress({
                        current: i + 1,
                        total: totalFiles,
                        percentage: fileProgress,
                        filename: file.name,
                        status: 'uploading',
                    });
                }
            });
            console.log('Uploaded URL:', url);
            uploadedUrls.push(url);

            // Report completion
            if (onProgress) {
                onProgress({
                    current: i + 1,
                    total: totalFiles,
                    percentage: 100,
                    filename: file.name,
                    status: 'completed',
                });
            }
        } catch (error) {
            // Report error for this file
            if (onProgress) {
                onProgress({
                    current: i + 1,
                    total: totalFiles,
                    percentage: 0,
                    filename: file.name,
                    status: 'error',
                    error: error.message,
                });
            }
            throw new Error(`Failed to upload ${file.name}: ${error.message}`);
        }
    }

    return uploadedUrls;
};

/**
 * Delete image (placeholder - implement if backend supports)
 * @param {string} imageUrl - URL of image to delete
 */
export const deleteImage = async (imageUrl) => {
    // TODO: Implement if backend provides delete endpoint
    console.log('Delete image:', imageUrl);
    return true;
};

export default {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    validateImage,
};
