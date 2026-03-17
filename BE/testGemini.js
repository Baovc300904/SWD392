require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

console.log("Loaded file:", __filename);
console.log("Has key:", !!process.env.GEMINI_API_KEY);
console.log("GoogleGenAI type:", typeof GoogleGenAI);

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function testGemini() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Trả lời đúng 1 từ: OK",
        });

        console.log("Gemini response:", response.text);
    } catch (error) {
        console.error("Gemini test failed:", error);
    }
}

testGemini();