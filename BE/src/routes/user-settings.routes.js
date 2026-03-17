/**
 * USER SETTINGS ROUTES
 * File: d:\GitHub\SWD392\BE\src\routes\user-settings.routes.js
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
    getUserSettings,
    updateUserSettings,
    toggleCloudinarySettings
} = require('../controllers/user-settings.controller');

/**
 * @swagger
 * tags:
 *   name: UserSettings
 *   description: User preferences and settings management
 */

/**
 * @swagger
 * /api/user-settings:
 *   get:
 *     summary: Get current user settings
 *     tags: [UserSettings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings
 */
router.get('/', authenticate, getUserSettings);

/**
 * @swagger
 * /api/user-settings:
 *   put:
 *     summary: Update user settings
 *     tags: [UserSettings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enable_cloudinary_upload:
 *                 type: boolean
 *                 description: Enable/disable Cloudinary file uploads
 *               enable_ai_assistant:
 *                 type: boolean
 *                 description: Enable/disable AI Assistant
 */
router.put('/', authenticate, updateUserSettings);

/**
 * @swagger
 * /api/user-settings/toggle-cloudinary:
 *   put:
 *     summary: Toggle Cloudinary upload setting
 *     tags: [UserSettings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Setting toggled
 */
router.put('/toggle-cloudinary', authenticate, toggleCloudinarySettings);

// Add to main routes file (app.js):
// const userSettingsRoutes = require('./routes/user-settings.routes');
// app.use('/api/user-settings', userSettingsRoutes);

// Also add to group routes:
// const { confirmGroup } = require('../controllers/group.controller');
// router.put('/:id/confirm', authenticate, authorize('lecturer', 'manager'), confirmGroup);

module.exports = router;
