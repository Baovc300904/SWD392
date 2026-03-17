/**
 * AI Routes
 * Endpoints for Gemini-powered AI assistant
 */

const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI assistant powered by Google Gemini
 */

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Send a message to the AI assistant
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: User message / question
 *               context:
 *                 type: string
 *                 description: Optional context to prepend (e.g. project info)
 *               model:
 *                 type: string
 *                 description: Gemini model override (default gemini-2.0-flash)
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *       400:
 *         description: Missing prompt
 *       429:
 *         description: Quota exceeded
 *       500:
 *         description: AI request failed
 */
router.post('/chat', authenticate, chat);

module.exports = router;
