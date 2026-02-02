const authService = require('../services/auth.service');
const MSG = require('../constants/messages');

/**
 * Authentication Controller
 * Handles HTTP requests for authentication operations
 * Delegates business logic to AuthService
 */

class AuthController {
    // Register new user
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            // Input validation
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: MSG.AUTH.ALL_FIELDS_REQUIRED
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: MSG.AUTH.PASSWORD_MIN_LENGTH
                });
            }

            // Call service layer
            const result = await authService.registerUser({ name, email, password });

            res.status(201).json({
                success: true,
                message: MSG.AUTH.REGISTER_SUCCESS,
                data: result
            });
        } catch (error) {
            // Handle service errors
            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: MSG.GENERAL.SERVER_ERROR,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Input validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: MSG.AUTH.EMAIL_REQUIRED + ' and ' + MSG.AUTH.PASSWORD_REQUIRED.toLowerCase()
                });
            }

            // Call service layer
            const result = await authService.loginUser(email, password);

            res.json({
                success: true,
                message: MSG.AUTH.LOGIN_SUCCESS,
                data: result
            });
        } catch (error) {
            // Handle service errors
            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: MSG.GENERAL.SERVER_ERROR,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Refresh access token
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            // Input validation
            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: MSG.AUTH.INVALID_REFRESH_TOKEN
                });
            }

            // Call service layer
            const result = await authService.refreshAccessToken(refreshToken);

            res.json({
                success: true,
                message: MSG.AUTH.TOKEN_REFRESHED,
                data: result
            });
        } catch (error) {
            // Handle service errors
            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: MSG.GENERAL.SERVER_ERROR,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Forgot password - reset directly with email
    async forgotPassword(req, res) {
        try {
            const { email, newPassword } = req.body;

            // Input validation
            if (!email || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and new password are required'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: MSG.AUTH.PASSWORD_MIN_LENGTH
                });
            }

            // Call service layer
            await authService.resetPassword(email, newPassword);

            res.json({
                success: true,
                message: MSG.AUTH.PASSWORD_RESET_SUCCESS
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: MSG.GENERAL.SERVER_ERROR,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new AuthController();
