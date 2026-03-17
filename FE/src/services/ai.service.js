import api from '../config/api.config';

const aiService = {
    isConfigured: () => true,

    generateReply: async ({ prompt, context = '', model }) => {
        if (!prompt?.trim()) {
            throw new Error('Prompt is required');
        }

        const payload = { prompt: prompt.trim() };
        if (context) payload.context = context;
        if (model) payload.model = model;

        const response = await api.post('/ai/chat', payload);

        if (response.status === 429) {
            throw new Error('AI quota exceeded – free tier limit reached. Please try again later or contact admin.');
        }

        const text = response.data?.data?.text;
        if (!text) {
            throw new Error('AI returned empty response');
        }

        return text;
    },
};

export default aiService;

