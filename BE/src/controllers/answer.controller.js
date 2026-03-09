/**
 * Answer Controller
 * Handles answers to Q&A questions
 */

const { Answer, Question, User } = require('../models');

/**
 * @desc    Get all answers for a question
 * @route   GET /api/questions/:questionId/answers
 * @access  Public
 */
exports.getAnswersByQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { isPublic } = req.query;

        const where = { questionId };
        if (isPublic !== undefined) {
            where.isPublic = isPublic === 'true';
        }

        const answers = await Answer.findAll({
            where,
            include: [
                { model: User, as: 'answerer', attributes: ['id', 'fullName', 'role'] }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json({
            success: true,
            count: answers.length,
            data: answers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching answers',
            error: error.message
        });
    }
};

/**
 * @desc    Create answer to a question
 * @route   POST /api/questions/:questionId/answers
 * @access  Private (Lecturer/Manager)
 */
exports.createAnswer = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { content, answeredBy, isPublic = false } = req.body;

        // Check if question exists
        const question = await Question.findByPk(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        const answer = await Answer.create({
            questionId,
            answeredBy,
            content,
            isPublic
        });

        // Optionally mark question as resolved
        if (req.body.markAsResolved) {
            question.status = 'RESOLVED';
            await question.save();
        }

        res.status(201).json({
            success: true,
            message: 'Answer created successfully',
            data: answer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating answer',
            error: error.message
        });
    }
};

/**
 * @desc    Update answer
 * @route   PUT /api/answers/:id
 * @access  Private (Owner)
 */
exports.updateAnswer = async (req, res) => {
    try {
        const { content, isPublic } = req.body;

        const answer = await Answer.findByPk(req.params.id);

        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        if (content !== undefined) answer.content = content;
        if (isPublic !== undefined) answer.isPublic = isPublic;

        await answer.save();

        res.status(200).json({
            success: true,
            message: 'Answer updated successfully',
            data: answer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating answer',
            error: error.message
        });
    }
};

/**
 * @desc    Toggle answer visibility (public/private)
 * @route   PUT /api/answers/:id/toggle-visibility
 * @access  Private (Owner/Admin)
 */
exports.toggleAnswerVisibility = async (req, res) => {
    try {
        const answer = await Answer.findByPk(req.params.id);

        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        answer.isPublic = !answer.isPublic;
        await answer.save();

        res.status(200).json({
            success: true,
            message: `Answer is now ${answer.isPublic ? 'public' : 'private'}`,
            data: answer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error toggling answer visibility',
            error: error.message
        });
    }
};

/**
 * @desc    Delete answer
 * @route   DELETE /api/answers/:id
 * @access  Private (Owner/Admin)
 */
exports.deleteAnswer = async (req, res) => {
    try {
        const answer = await Answer.findByPk(req.params.id);

        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        await answer.destroy();

        res.status(200).json({
            success: true,
            message: 'Answer deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting answer',
            error: error.message
        });
    }
};

/**
 * @desc    Get all public answers
 * @route   GET /api/answers/public
 * @access  Public
 */
exports.getPublicAnswers = async (req, res) => {
    try {
        const answers = await Answer.findAll({
            where: { isPublic: true },
            include: [
                {
                    model: Question,
                    as: 'question',
                    attributes: ['id', 'title', 'content']
                },
                {
                    model: User,
                    as: 'answerer',
                    attributes: ['id', 'fullName', 'role']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: answers.length,
            data: answers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching public answers',
            error: error.message
        });
    }
};
