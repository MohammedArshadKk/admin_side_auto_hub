/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

// Use relative URL in development (proxy), absolute in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Admin login
 * @param {string} username - Admin username or email
 * @param {string} password - Admin password
 * @returns {Promise<Object>} - Login response with user data
 */
export const adminLogin = async (username, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        return data;
    } catch (error) {
        console.error('Admin login error:', error);
        throw error;
    }
};

/**
 * Check current authentication status
 * @returns {Promise<Object>} - User data if authenticated
 */
export const checkAuth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Not authenticated');
        }

        return data;
    } catch (error) {
        console.error('Auth check error:', error);
        throw error;
    }
};

/**
 * Logout user
 * @returns {Promise<Object>} - Logout response
 */
export const logout = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Logout failed');
        }

        return data;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

export default {
    adminLogin,
    checkAuth,
    logout,
};
