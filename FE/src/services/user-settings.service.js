import api from '../config/api.config';

const SETTINGS_KEY = 'userSettings';

const DEFAULT_SETTINGS = {
    enableCloudinaryUpload: true,
    enableAIAssistant: true,
    aiModel: 'gemini-2.0-flash',
};

const userSettingsService = {
    getSettings: () => {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (!raw) return { ...DEFAULT_SETTINGS };

            const parsed = JSON.parse(raw);
            if (parsed.enableCloudinaryUpload === undefined && parsed.enableFirebaseUpload !== undefined) {
                parsed.enableCloudinaryUpload = parsed.enableFirebaseUpload;
            }

            return { ...DEFAULT_SETTINGS, ...parsed };
        } catch {
            return { ...DEFAULT_SETTINGS };
        }
    },

    updateSettings: (partialSettings) => {
        const current = userSettingsService.getSettings();
        const next = { ...current, ...partialSettings };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        return next;
    },

    getDefaultSettings: () => ({ ...DEFAULT_SETTINGS }),

    // ========== API Methods ==========

    /**
     * Fetch settings from server
     */
    fetchServerSettings: async () => {
        try {
            const response = await api.get('/user-settings');
            if (response.data?.success) {
                return response.data.data;
            }
            throw new Error(response.data?.message || 'Failed to fetch settings');
        } catch (error) {
            console.warn('Could not fetch server settings, using localStorage:', error.message);
            return userSettingsService.getSettings();
        }
    },

    /**
     * Update settings on server
     */
    saveServerSettings: async (settings) => {
        try {
            const response = await api.put('/user-settings', settings);
            if (response.data?.success) {
                // Also save locally
                userSettingsService.updateSettings(response.data.data);
                return response.data.data;
            }
            throw new Error(response.data?.message || 'Failed to save settings');
        } catch (error) {
            console.warn('Could not save to server, saving locally:', error.message);
            return userSettingsService.updateSettings(settings);
        }
    },

    /**
     * Toggle Cloudinary upload on server
     */
    toggleCloudinaryUpload: async () => {
        try {
            const response = await api.put('/user-settings/toggle-cloudinary');
            if (response.data?.success) {
                userSettingsService.updateSettings({
                    enableCloudinaryUpload: response.data.data.enable_cloudinary_upload
                });
                return response.data.data;
            }
            throw new Error(response.data?.message || 'Failed to toggle setting');
        } catch (error) {
            console.warn('Could not toggle on server, toggling locally:', error.message);
            const current = userSettingsService.getSettings();
            return userSettingsService.updateSettings({
                enableCloudinaryUpload: !current.enableCloudinaryUpload
            });
        }
    }
};

export default userSettingsService;
