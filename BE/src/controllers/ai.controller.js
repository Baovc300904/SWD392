/**
 * AI Controller
 * Handles AI chat requests via Gemini (server-side, API key is never exposed to client)
 */

const { generateGeminiDraft } = require('../services/ai/services/geminiDraft.service');

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

/**
 * POST /api/ai/chat
 * Body: { prompt: string, context?: string, model?: string }
 */
const chat = async (req, res) => {
    const { prompt, context, model } = req.body;

    if (!prompt || !String(prompt).trim()) {
        return res.status(400).json({ success: false, message: 'prompt is required' });
    }

    const fullPrompt = context
        ? `Context:\n${context}\n\nQuestion:\n${prompt}`
        : String(prompt).trim();

    try {
        const text = await generateGeminiDraft(fullPrompt, model || DEFAULT_MODEL);
        return res.json({ success: true, data: { text } });
    } catch (error) {
        // Rate limit
        if (error?.status === 429) {
            return res.status(429).json({ success: false, message: 'AI quota exceeded. Please try again later.' });
        }
        console.error('[AI] Gemini error:', error?.message || error);
        return res.status(500).json({ success: false, message: 'AI request failed. Please try again.' });
    }
};

module.exports = { chat };
