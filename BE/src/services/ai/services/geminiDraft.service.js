// geminiDraft.service.js
// Service để làm việc với Google Gemini API (draft)

const { GoogleGenerativeAI } = require('@google/genai');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error('Vui lòng thiết lập biến môi trường GEMINI_API_KEY trong file .env');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

/**
 * Gửi prompt tới Gemini và nhận kết quả trả về
 * @param {string|string[]} prompt - Nội dung prompt gửi tới Gemini
 * @returns {Promise<string>} - Kết quả trả về từ Gemini
 */
async function generateGeminiDraft(prompt) {
    try {
        const result = await model.generateContent(Array.isArray(prompt) ? prompt : [prompt]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Lỗi khi gọi Gemini API:', error);
        throw error;
    }
}

module.exports = {
    generateGeminiDraft,
};
