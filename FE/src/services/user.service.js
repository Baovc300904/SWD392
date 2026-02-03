import api from '../config/api.config';

const userService = {
    /**
     * Get all users (Admin only)
     * @returns {Promise<Array>} List of all users
     */
    getAllUsers: async () => {
        try {
            const response = await api.get('/users');
            return response.data || [];
        } catch (error) {
            console.error('Get all users error:', error);
            throw error;
        }
    },

    /**
     * Get current user profile
     * @returns {Promise<Object>} Current user data
     */
    getMe: async () => {
        try {
            const response = await api.get('/users/me');
            return response.data;
        } catch (error) {
            console.error('Get me error:', error);
            throw error;
        }
    },

    /**
     * Get user by ID
     * @param {number} id - User ID
     * @returns {Promise<Object>} User data
     */
    getUserById: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get user by ID error:', error);
            throw error;
        }
    },

    /**
     * Create new user (Admin only)
     * @param {Object} userData - User data
     * @param {string} userData.studentCode - Student code
     * @param {string} userData.name - Full name
     * @param {string} userData.email - Email
     * @param {string} userData.password - Password
     * @param {string} userData.role - User role (optional)
     * @returns {Promise<Object>} Created user data
     */
    createUser: async (userData) => {
        try {
            const response = await api.post('/users', userData);
            return response.data;
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    },

    /**
     * Update user
     * @param {number} id - User ID
     * @param {Object} userData - Updated user data
     * @returns {Promise<Object>} Updated user data
     */
    updateUser: async (id, userData) => {
        try {
            const response = await api.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    },

    /**
     * Delete user (Admin only)
     * @param {number} id - User ID
     * @returns {Promise<Object>} Delete confirmation
     */
    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete user error:', error);
            throw error;
        }
    }
};

export default userService;
