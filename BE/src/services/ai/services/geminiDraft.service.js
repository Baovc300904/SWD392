// geminiDraft.service.js
// Service để làm việc với Google Gemini API

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error('Vui lòng thiết lập biến môi trường GEMINI_API_KEY trong file .env');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Gửi prompt tới Gemini và nhận kết quả trả về
 * @param {string} prompt - Nội dung prompt gửi tới Gemini
 * @param {string} [model] - Model Gemini sử dụng (mặc định: gemini-2.5-flash)
 * @returns {Promise<string>} - Kết quả trả về từ Gemini
 */
async function generateGeminiDraft(prompt, model = 'gemini-2.5-flash') {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: Array.isArray(prompt) ? prompt.join('\n') : prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Lỗi khi gọi Gemini API:', error);
        throw error;
    }
}

module.exports = {
    generateGeminiDraft,
};
