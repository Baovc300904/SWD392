/**
 * USER SETTINGS CONTROLLER
 * File: d:\GitHub\SWD392\BE\src\controllers\user-settings.controller.js
 * Quản lý cài đặt của người dùng (Cloudinary, AI settings, v.v)
 */

const { UserSetting, User } = require('../models');
const MSG = require('../constants/messages');

const getRequesterId = (req) => req.user?.userId || req.user?.id;

/**
 * @desc    Get user settings
 * @route   GET /api/user-settings
 * @access  Private
 */
const getUserSettings = async (req, res) => {
    try {
        const userId = getRequesterId(req);

        let settings = await UserSetting.findOne({
            where: { user_id: userId }
        });

        // Auto-create if not exists
        if (!settings) {
            settings = await UserSetting.create({
                user_id: userId,
                enable_cloudinary_upload: true,
                enable_ai_assistant: true
            });
        }

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Update user settings
 * @route   PUT /api/user-settings
 * @access  Private
 * @body    { enable_cloudinary_upload?: bool, enable_ai_assistant?: bool }
 */
const updateUserSettings = async (req, res) => {
    try {
        const userId = getRequesterId(req);
        const updates = req.body;

        // Validate input
        if (typeof updates.enable_cloudinary_upload !== undefined && 
            typeof updates.enable_cloudinary_upload !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Invalid value for enable_cloudinary_upload'
            });
        }

        let settings = await UserSetting.findOne({
            where: { user_id: userId }
        });

        // Auto-create if not exists
        if (!settings) {
            settings = await UserSetting.create({
                user_id: userId,
                ...updates
            });
        } else {
            await settings.update(updates);
        }

        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Toggle Cloudinary upload setting
 * @route   PUT /api/user-settings/toggle-cloudinary
 * @access  Private
 */
const toggleCloudinarySettings = async (req, res) => {
    try {
        const userId = getRequesterId(req);

        let settings = await UserSetting.findOne({
            where: { user_id: userId }
        });

        if (!settings) {
            settings = await UserSetting.create({
                user_id: userId,
                enable_cloudinary_upload: true
            });
        }

        const newValue = !settings.enable_cloudinary_upload;
        await settings.update({ enable_cloudinary_upload: newValue });

        res.status(200).json({
            success: true,
            message: `Cloudinary upload ${newValue ? 'enabled' : 'disabled'}`,
            data: {
                enable_cloudinary_upload: newValue
            }
        });
    } catch (error) {
        console.error('Error toggling cloudinary setting:', error);
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getUserSettings,
    updateUserSettings,
    toggleCloudinarySettings
};
