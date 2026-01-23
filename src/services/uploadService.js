/**
 * Upload Service - S3 Image Upload with Compression
 */

import imageCompression from 'browser-image-compression';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Compress image while maintaining quality
 * @param {File} imageFile - Original image file
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (imageFile) => {
    const options = {
        maxSizeMB: 1, // Max size 1MB after compression
        maxWidthOrHeight: 1920, // Max dimension (Full HD)
        useWebWorker: true,
        fileType: 'image/jpeg', // Convert to JPEG for better compression
        initialQuality: 0.85, // 85% quality - maintains visual quality
    };

    try {
        console.log('📸 Original file size:', (imageFile.size / 1024 / 1024).toFixed(2), 'MB');

        const compressedFile = await imageCompression(imageFile, options);

        console.log('✅ Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
        console.log('📉 Compression ratio:', ((1 - compressedFile.size / imageFile.size) * 100).toFixed(2) + '%');

        return compressedFile;
    } catch (error) {
        console.error('❌ Image compression error:', error);
        // Return original if compression fails
        return imageFile;
    }
};

/**
 * Get presigned URL for S3 upload
 * @param {string} filename - File name
 * @param {string} contentType - MIME type
 * @param {number} fileSize - File size in bytes
 * @returns {Promise<Object>} - uploadUrl and imageUrl
 */
export const getPresignedUrl = async (filename, contentType, fileSize) => {
    try {
        const response = await fetch(`${API_BASE_URL}/upload/presigned-url`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename,
                contentType,
                fileSize,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Presigned URL error:', result);
            throw new Error(result.message || 'Failed to get upload URL');
        }

        // Backend returns { status: "success", data: { uploadUrl, imageUrl, key, expiresIn } }
        const { uploadUrl, imageUrl } = result.data || {};

        if (!uploadUrl || !imageUrl) {
            console.error('❌ Invalid response:', result);
            throw new Error('Missing uploadUrl or imageUrl in response');
        }

        console.log('✅ Got presigned URL');
        return { uploadUrl, imageUrl };
    } catch (error) {
        console.error('Get presigned URL error:', error);
        throw error;
    }
};

/**
 * Upload file to S3 using presigned URL
 * @param {string} uploadUrl - Presigned URL from backend
 * @param {File} file - File object
 * @param {string} contentType - MIME type
 * @returns {Promise<void>}
 */
export const uploadToS3 = async (uploadUrl, file, contentType) => {
    try {
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
            },
            body: file,
        });

        if (!response.ok) {
            throw new Error('Failed to upload to S3');
        }
    } catch (error) {
        console.error('S3 upload error:', error);
        throw error;
    }
};

/**
 * Complete upload workflow: compress → get presigned URL → upload to S3
 * @param {File} file - File to upload
 * @returns {Promise<string>} - Final S3 image URL
 */
export const uploadImage = async (file) => {
    try {
        // Step 1: Compress image (maintains 85% quality, max 1MB)
        const compressedFile = await compressImage(file);

        // Step 2: Get presigned URL (using compressed file info)
        const { uploadUrl, imageUrl } = await getPresignedUrl(
            compressedFile.name,
            compressedFile.type,
            compressedFile.size
        );

        // Step 3: Upload compressed file to S3
        await uploadToS3(uploadUrl, compressedFile, compressedFile.type);

        // Step 4: Return final image URL
        return imageUrl;
    } catch (error) {
        console.error('Image upload error:', error);
        throw error;
    }
};

export default {
    compressImage,
    getPresignedUrl,
    uploadToS3,
    uploadImage,
};
