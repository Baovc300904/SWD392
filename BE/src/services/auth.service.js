const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');
const User = require('../models/user.model');
const MSG = require('../constants/messages');

/**
 * Authentication Service
 * Handles business logic for authentication operations
 */

class AuthService {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Object} - Created user and tokens
     */
    async registerUser(userData) {
        const { name, email, password } = userData;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw { statusCode: 409, message: MSG.AUTH.EMAIL_EXISTS };
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            role: 'user'
        });

        // Generate tokens
        const tokens = this.generateTokens(user);

        // Save refresh token to database
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return {
            user: user.toJSON(),
            ...tokens
        };
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Object} - User and tokens
     */
    async loginUser(email, password) {
        // Find user by email (include password for comparison)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            throw { statusCode: 401, message: MSG.AUTH.INVALID_CREDENTIALS };
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw { statusCode: 401, message: MSG.AUTH.INVALID_CREDENTIALS };
        }

        // Generate tokens
        const tokens = this.generateTokens(user);

        // Save refresh token to database
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return {
            user: user.toJSON(),
            ...tokens
        };
    }

    /**
     * Refresh access token
     * @param {string} refreshToken - Refresh token
     * @returns {Object} - New access token
     */
    async refreshAccessToken(refreshToken) {
        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
        } catch (error) {
            throw { statusCode: 403, message: MSG.AUTH.INVALID_REFRESH_TOKEN };
        }

        // Find user and validate refresh token
        const user = await User.findById(decoded.userId).select('+refreshToken');
        if (!user || user.refreshToken !== refreshToken) {
            throw { statusCode: 403, message: MSG.AUTH.INVALID_REFRESH_TOKEN };
        }

        // Generate new access token
        const accessToken = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        return {
            accessToken,
            expiresIn: jwtConfig.expiresIn
        };
    }

    /**
     * Reset password using email
     * @param {string} email - User email
     * @param {string} newPassword - New password
     */
    async resetPassword(email, newPassword) {
        // Find user by email
        const user = await User.findOne({ email });

        // Don't reveal if user exists (security best practice)
        if (!user) {
            return;
        }

        // Update password
        user.password = newPassword;
        user.refreshToken = undefined; // Invalidate all refresh tokens
        await user.save();
    }

    /**
     * Generate access and refresh tokens
     * @param {Object} user - User object
     * @returns {Object} - Access token and refresh token
     */
    generateTokens(user) {
        const accessToken = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        const refreshToken = jwt.sign(
            {
                userId: user._id
            },
            jwtConfig.refreshSecret,
            { expiresIn: jwtConfig.refreshExpiresIn }
        );

        return {
            accessToken,
            refreshToken,
            expiresIn: jwtConfig.expiresIn
        };
    }
}

module.exports = new AuthService();
