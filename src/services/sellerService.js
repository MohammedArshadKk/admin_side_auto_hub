/**
 * Seller Service - API calls for seller management
 * Base URL: http://localhost:5000/api/v1/sellers
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Helper function for API requests with authentication
 */
const fetchWithAuth = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            ...options,
            credentials: 'include', // Include admin cookie
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

// ==================== ADMIN SELLER ENDPOINTS ==================== //

/**
 * Admin: Create new seller
 * @param {Object} sellerData - Seller information
 * @returns {Promise<Object>} - Created seller response
 */
export const createSeller = async (sellerData) => {
    return fetchWithAuth(`${API_BASE_URL}/sellers/admin/create`, {
        method: 'POST',
        body: JSON.stringify(sellerData),
    });
};

/**
 * Admin: Get all sellers with pagination and filters
 * @param {Object} filters - Query filters (page, limit, verificationStatus, search)
 * @returns {Promise<Object>} - Sellers list with pagination
 */
export const getAllSellers = async (filters = {}) => {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== '') {
            queryParams.append(key, filters[key]);
        }
    });

    const url = `${API_BASE_URL}/sellers/admin?${queryParams.toString()}`;
    return fetchWithAuth(url);
};

/**
 * Admin: Get seller by ID
 * @param {string} sellerId - Seller ID
 * @returns {Promise<Object>} - Seller data
 */
export const getSellerById = async (sellerId) => {
    return fetchWithAuth(`${API_BASE_URL}/sellers/admin/${sellerId}`);
};

/**
 * Admin: Verify seller
 * @param {string} sellerId - Seller ID
 * @returns {Promise<Object>} - Verification response
 */
export const verifySeller = async (sellerId) => {
    return fetchWithAuth(`${API_BASE_URL}/sellers/admin/${sellerId}/verify`, {
        method: 'PATCH',
    });
};

/**
 * Admin: Reject seller
 * @param {string} sellerId - Seller ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} - Rejection response
 */
export const rejectSeller = async (sellerId, reason) => {
    return fetchWithAuth(`${API_BASE_URL}/sellers/admin/${sellerId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
    });
};

/**
 * Admin: Block seller
 * @param {string} sellerId - Seller ID
 * @param {string} reason - Block reason
 * @returns {Promise<Object>} - Block response
 */
export const blockSeller = async (sellerId, reason) => {
    return fetchWithAuth(`${API_BASE_URL}/sellers/admin/${sellerId}/block`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
    });
};

/**
 * Admin: Unblock seller
 * @param {string} sellerId - Seller ID
 * @returns {Promise<Object>} - Unblock response
 */
export const unblockSeller = async (sellerId) => {
    return fetchWithAuth(`${API_BASE_URL}/sellers/admin/${sellerId}/unblock`, {
        method: 'PATCH',
    });
};

/**
 * Admin: Update seller
 * @param {string} sellerId - Seller ID
 * @param {Object} sellerData - Updated seller data
 * @returns {Promise<Object>} - Updated seller response
 */
export const updateSellerAdmin = async (sellerId, sellerData) => {
    return fetchWithAuth(`${API_BASE_URL}/sellers/admin/${sellerId}`, {
        method: 'PATCH',
        body: JSON.stringify(sellerData),
    });
};

export default {
    createSeller,
    getAllSellers,
    getSellerById,
    verifySeller,
    rejectSeller,
    blockSeller,
    unblockSeller,
    updateSellerAdmin,
};
