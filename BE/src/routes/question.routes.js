/**
 * Question Routes
 * API endpoints for Q&A questions
 */

const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');

/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: Q&A Questions Management
 */

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get all questions (with optional filters)
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [WAITING_LECTURER, ESCALATED_TO_MANAGER, RESOLVED]
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of questions
 */
router.get('/', questionController.getAllQuestions);

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Question details
 *       404:
 *         description: Question not found
 */
router.get('/:id', questionController.getQuestionById);

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Create new question
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - groupId
 *               - askedBy
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               groupId:
 *                 type: integer
 *               askedBy:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Question created
 */
router.post('/', questionController.createQuestion);

/**
 * @swagger
 * /api/questions/{id}/escalate:
 *   put:
 *     summary: Escalate question to Manager
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Question escalated
 */
router.put('/:id/escalate', questionController.escalateQuestion);

/**
 * @swagger
 * /api/questions/{id}/resolve:
 *   put:
 *     summary: Mark question as resolved
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Question resolved
 */
router.put('/:id/resolve', questionController.resolveQuestion);

/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Delete question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Question deleted
 */
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;
