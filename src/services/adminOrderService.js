/**
 * Admin Order Service - API calls for order management
 * Base URL: /api/v1/orders/admin
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

/**
 * Admin: Get all orders with pagination and filters
 * @param {Object} filters - Query filters (page, limit, sellerId, status, search, etc.)
 * @returns {Promise<Object>} - Orders list with pagination
 */
export const getAllOrders = async (filters = {}) => {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== '') {
            queryParams.append(key, filters[key]);
        }
    });

    const url = `${API_BASE_URL}/orders/admin/all?${queryParams.toString()}`;
    return fetchWithAuth(url);
};

/**
 * Admin: Get order details by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} - Order details
 */
export const getAdminOrderById = async (orderId) => {
    return fetchWithAuth(`${API_BASE_URL}/orders/admin/${orderId}`);
};

/**
 * Admin: Update order status (Override)
 * @param {string} orderId - Order ID
 * @param {string} status - New order status
 * @param {string} note - Optional note for status history
 * @returns {Promise<Object>} - Update response
 */
export const updateAdminOrderStatus = async (orderId, status, note = '') => {
    return fetchWithAuth(`${API_BASE_URL}/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
    });
};

export default {
    getAllOrders,
    getAdminOrderById,
    updateAdminOrderStatus,
};
