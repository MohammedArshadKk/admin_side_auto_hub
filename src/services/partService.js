/**
 * Frontend Part Service
 * Handles all API calls to the Parts API
 */

// Use proxy in development, or explicit URL in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Helper function for API requests with error handling
 */
const fetchWithAuth = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            ...options,
            credentials: 'include', // Send cookies
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// ==================== PUBLIC ENDPOINTS ==================== //

/**
 * Get all active parts (with filters)
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} - Parts list with pagination
 */
export const getParts = async (filters = {}) => {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== '') {
            queryParams.append(key, filters[key]);
        }
    });

    const url = `${API_BASE_URL}/parts?${queryParams.toString()}`;
    return fetchWithAuth(url);
};

/**
 * Get single part by ID
 * @param {string} partId - Part ID
 * @returns {Promise<Object>} - Part data
 */
export const getPartById = async (partId) => {
    return fetchWithAuth(`${API_BASE_URL}/parts/${partId}`);
};

// ==================== ADMIN ENDPOINTS ==================== //

/**
 * Admin: Get all parts (including deleted)
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} - All parts with pagination and status counts
 */
export const getAllPartsAdmin = async (filters = {}) => {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== '') {
            queryParams.append(key, filters[key]);
        }
    });

    const url = `${API_BASE_URL}/parts/admin/all?${queryParams.toString()}`;
    return fetchWithAuth(url);
};

/**
 * Admin: Create new part
 * @param {Object} partData - Part data
 * @returns {Promise<Object>} - Created part response
 */
export const createPart = async (partData) => {
    return fetchWithAuth(`${API_BASE_URL}/parts/admin`, {
        method: 'POST',
        body: JSON.stringify(partData),
    });
};

/**
 * Admin: Update part
 * @param {string} partId - Part ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} - Updated part response
 */
export const updatePart = async (partId, updates) => {
    return fetchWithAuth(`${API_BASE_URL}/parts/admin/${partId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });
};

/**
 * Admin: Delete part (soft delete)
 * @param {string} partId - Part ID
 * @returns {Promise<Object>} - Delete response
 */
export const deletePart = async (partId) => {
    return fetchWithAuth(`${API_BASE_URL}/parts/admin/${partId}`, {
        method: 'DELETE',
    });
};

export default {
    getParts,
    getPartById,
    getAllPartsAdmin,
    createPart,
    updatePart,
    deletePart,
};
