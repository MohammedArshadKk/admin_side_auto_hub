/**
 * Shared API Utility for Admin Side
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Fetch wrapper with credentials (cookies) included
 * @param {string} endpoint - API endpoint (e.g., '/config')
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - JSON response
 */
export const fetchWithCredentials = async (endpoint, options = {}) => {
    // Normalize URL
    const url = endpoint.startsWith('http')
        ? endpoint
        : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: 'include',
    };

    try {
        const response = await fetch(url, config);

        // Handle 401 Unauthorized globally if needed (optional)
        if (response.status === 401) {
            // potentially redirect to login or throw specific error
            // window.location.href = '/login'; 
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Request failed: ${url}`, error);
        throw error;
    }
};
