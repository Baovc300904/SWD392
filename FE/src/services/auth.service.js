import api from '../config/api.config';

const authService = {
    /**
     * Register new user
     * @param {Object} data - Registration data
     * @param {string} data.studentCode - Student code (SE######)
     * @param {string} data.fullName - Full name (will be transformed to 'name')
     * @param {string} data.email - Email address
     * @param {string} data.password - Password
     * @param {string} data.confirmPassword - Password confirmation
     * @returns {Promise<Object>} User data with token
     */
    register: async (data) => {
        try {
            console.log('🚀 Calling register API with data:', {
                studentCode: data.studentCode,
                name: data.fullName,
                email: data.email,
                hasPassword: !!data.password,
                hasConfirmPassword: !!data.confirmPassword
            });

            const response = await api.post('/auth/register', {
                studentCode: data.studentCode,
                name: data.fullName, // Transform fullName → name for backend
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword
            });

            console.log('✅ Register API response:', response);

            if (response.success && response.data) {
                const userData = {
                    ...response.data.user,
                    token: response.data.accessToken,
                    refreshToken: response.data.refreshToken
                };
                localStorage.setItem('user', JSON.stringify(userData));
                console.log('✅ User saved to localStorage:', userData);
                return userData;
            }

            throw new Error(response.message || 'Registration failed');
        } catch (error) {
            console.error('❌ Registration error:', error);
            console.error('❌ Error details:', {
                message: error.message,
                status: error.status,
                data: error.data
            });
            throw error;
        }
    },

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data with token
     */
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.success && response.data) {
                const userData = {
                    ...response.data.user,
                    token: response.data.accessToken,
                    refreshToken: response.data.refreshToken
                };
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }

            throw new Error(response.message || 'Login failed');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    /**
     * Refresh access token
     * @returns {Promise<Object>} Updated user data with new token
     */
    refreshToken: async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            if (!user.refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await api.post('/auth/refresh', {
                refreshToken: user.refreshToken
            });

            if (response.success && response.data) {
                const userData = {
                    ...user,
                    token: response.data.accessToken
                };
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }

            throw new Error(response.message || 'Token refresh failed');
        } catch (error) {
            console.error('Refresh token error:', error);
            // If refresh fails, logout user
            authService.logout();
            throw error;
        }
    },

    /**
     * Reset password (forgot password)
     * @param {string} email - User email
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Response message
     */
    forgotPassword: async (email, newPassword) => {
        try {
            const response = await api.post('/auth/forgot-password', {
                email,
                newPassword
            });

            return response;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    },

    /**
     * Logout user (clear local storage)
     */
    logout: () => {
        localStorage.removeItem('user');
    },

    /**
     * Get current user from localStorage
     * @returns {Object|null} User data or null
     */
    getCurrentUser: () => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    }
};

export default authService;
