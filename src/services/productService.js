/**
 * Product API Service
 * Handles all product-related API calls
 */

// Use relative URL in development (proxy), absolute in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Create a new product (Admin)
 * @param {Object} productData - Product data matching backend schema
 * @returns {Promise<Object>} - Created product response
 */
export const createProduct = async (productData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/admin`, {
            method: 'POST',
            credentials: 'include', // Send auth cookies
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create product');
        }

        return data;
    } catch (error) {
        console.error('Create product error:', error);
        throw error;
    }
};

/**
 * Update an existing product (Admin)
 * @param {string} productId - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} - Updated product response
 */
export const updateProduct = async (productId, productData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/admin/${productId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update product');
        }

        return data;
    } catch (error) {
        console.error('Update product error:', error);
        throw error;
    }
};

/**
 * Get product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Product data
 */
export const getProduct = async (productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch product');
        }

        return data;
    } catch (error) {
        console.error('Get product error:', error);
        throw error;
    }
};

/**
 * Get all products (with filters)
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} - Products list
 */
export const getProducts = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/products${queryParams ? `?${queryParams}` : ''}`;

        const response = await fetch(url, {
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch products');
        }

        return data;
    } catch (error) {
        console.error('Get products error:', error);
        throw error;
    }
};

/**
 * Delete product (Admin)
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Delete response
 */
export const deleteProduct = async (productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/admin/${productId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete product');
        }

        return data;
    } catch (error) {
        console.error('Delete product error:', error);
        throw error;
    }
};

/**
 * Bulk create products (Admin)
 * @param {Array} products - Array of product data objects
 * @returns {Promise<Object>} - Bulk creation response with results
 */
export const bulkCreateProducts = async (products) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/bulk`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ products }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to bulk create products');
        }

        return data;
    } catch (error) {
        console.error('Bulk create products error:', error);
        throw error;
    }
};

export default {
    createProduct,
    updateProduct,
    getProduct,
    getProducts,
    deleteProduct,
    bulkCreateProducts,
};
