const SETTINGS_KEY = 'userSettings';

const DEFAULT_SETTINGS = {
    enableFirebaseUpload: true,
    enableAIAssistant: true,
    aiModel: 'gemini-2.0-flash',
};

const userSettingsService = {
    getSettings: () => {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (!raw) return { ...DEFAULT_SETTINGS };
            return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
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
};

export default userSettingsService;
