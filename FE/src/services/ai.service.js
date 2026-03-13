const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_BASE_URL = import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';

const aiService = {
    isConfigured: () => !!GEMINI_API_KEY,

    generateReply: async ({ prompt, context = '', model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash' }) => {
        if (!prompt?.trim()) {
            throw new Error('Prompt is required');
        }

        if (!GEMINI_API_KEY) {
            throw new Error('AI key is not configured');
        }

        const payload = {
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `${context ? `Context:\n${context}\n\n` : ''}Question:\n${prompt}`,
                        },
                    ],
                },
            ],
        };

        const response = await fetch(`${GEMINI_BASE_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.status === 429) {
            throw new Error('AI quota exceeded – free tier limit reached. Please try again later or contact admin.');
        }
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI request failed (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('AI returned empty response');
        }

        return text;
    },
};

export default aiService;
