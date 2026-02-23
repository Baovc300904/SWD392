import api from '../config/api.config';

/* ── Helper: chọn storage dựa theo Remember Me flag ── */
const getStorage = () =>
    localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;

const authService = {
    /**
     * Register new user
     * @param {Object} data - Registration data
     * @param {string} data.studentCode - Student code (SE######) - Optional
     * @param {string} data.fullName - Full name
     * @param {string} data.email - Email address
     * @param {string} data.password - Password
     * @param {string} data.confirmPassword - Password confirmation
     * @returns {Promise<Object>} Registration response (requires OTP verification)
     */
    register: async (data) => {
        try {
            const response = await api.post('/auth/register', {
                studentCode: data.studentCode,
                fullName: data.fullName,
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword
            });

            if (response.success) {
                return response.data;
            }
            throw new Error(response.message || 'Registration failed');
        } catch (error) {
            throw error;
        }
    },

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data with token
     */
    login: async (email, password, rememberMe = false) => {
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.success && response.data) {
                const userData = {
                    ...response.data.user,
                    token: response.data.accessToken,
                    refreshToken: response.data.refreshToken
                };
                // Lưu flag trước để getStorage() dùng đúng
                localStorage.setItem('rememberMe', String(rememberMe));
                // Lưu user vào đúng storage
                getStorage().setItem('user', JSON.stringify(userData));
                // Đảm bảo storage kia không còn user cũ
                if (rememberMe) sessionStorage.removeItem('user');
                else localStorage.removeItem('user');
                return userData;
            }

            throw new Error(response.message || 'Login failed');
        } catch (error) {
            throw error;
        }
    },

    /**
     * Refresh access token
     * @returns {Promise<Object>} Updated user data with new token
     */
    refreshToken: async () => {
        try {
            const storage = getStorage();
            const user = JSON.parse(storage.getItem('user') || '{}');

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
                storage.setItem('user', JSON.stringify(userData));
                return userData;
            }

            throw new Error(response.message || 'Token refresh failed');
        } catch (error) {
            console.error('Refresh token error:', error);
            authService.logout();
            throw error;
        }
    },

    /**
     * Send OTP for password reset (forgot password step 1)
     * @param {string} email - User email
     * @returns {Promise<Object>} Response message
     */
    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            console.log('✅ OTP sent to email:', response);
            return response;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    },

    /**
     * Reset password with OTP (forgot password step 2)
     * @param {Object} data - Reset data
     * @param {string} data.email - User email
     * @param {string} data.otp - OTP code
     * @param {string} data.newPassword - New password
     * @returns {Promise<Object>} Response message
     */
    resetPassword: async (data) => {
        try {
            const response = await api.post('/auth/reset-password', data);
            console.log('✅ Password reset successful:', response);
            return response;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    },

    /**
     * Verify OTP after registration
     * @param {Object} data - Verification data
     * @param {string} data.email - User email
     * @param {string} data.otp - OTP code
     * @returns {Promise<Object>} Response with user and token
     */
    verifyOTP: async (data) => {
        try {
            const response = await api.post('/auth/verify-otp', data);
            console.log('✅ OTP verified:', response);

            if (response.success && response.data) {
                const userData = {
                    ...response.data.user,
                    token: response.data.accessToken,
                    refreshToken: response.data.refreshToken
                };
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }

            return response;
        } catch (error) {
            console.error('Verify OTP error:', error);
            throw error;
        }
    },

    /**
     * Resend OTP code
     * @param {string} email - User email
     * @returns {Promise<Object>} Response message
     */
    resendOTP: async (email) => {
        try {
            const response = await api.post('/auth/resend-otp', { email });
            console.log('✅ OTP resent:', response);
            return response;
        } catch (error) {
            console.error('Resend OTP error:', error);
            throw error;
        }
    },

    /**
     * Admin/Lecturer Login with role validation
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} role - Required role ('Admin' or 'Lecturer')
     * @returns {Promise<Object>} User data with token
     */
    adminLecturerLogin: async (email, password, role) => {
        try {
            const response = await api.post('/auth/admin-lecturer-login', {
                email,
                password,
                role
            });

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
            console.error('Admin/Lecturer login error:', error);
            throw error;
        }
    },

    /**
     * Logout user (clear local storage)
     */
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch { /* ignore */ } finally {
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            localStorage.removeItem('rememberMe');
        }
    },

    /**
     * Change password (authenticated user)
     * @param {string} currentPassword
     * @param {string} newPassword
     * @param {string} confirmPassword
     */
    changePassword: async (currentPassword, newPassword, confirmPassword) => {
        try {
            const response = await api.post('/auth/change-password', {
                currentPassword,
                newPassword,
                confirmPassword
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get current user from localStorage
     * @returns {Object|null} User data or null
     */
    getCurrentUser: () => {
        try {
            // Ưu tiên sessionStorage (không remember), fallback localStorage (remember)
            const raw = sessionStorage.getItem('user') || localStorage.getItem('user');
            return JSON.parse(raw || 'null');
        } catch {
            return null;
        }
    },

    /**
     * Check if user chose "Remember Me"
     * @returns {boolean}
     */
    isRemembered: () => localStorage.getItem('rememberMe') === 'true'
};

export default authService;
