/**
 * Question Controller
 * Handles Q&A questions with hierarchical escalation
 */

const { Question, User, StudentGroup, Answer } = require('../models');

/**
 * @desc    Get all questions (with filters)
 * @route   GET /api/questions
 * @access  Public
 */
exports.getAllQuestions = async (req, res) => {
    try {
        const { status, groupId } = req.query;

        const where = {};
        if (status) where.status = status;
        if (groupId) where.groupId = groupId;

        const questions = await Question.findAll({
            where,
            include: [
                { model: User, as: 'asker', attributes: ['id', 'fullName', 'email'] },
                { model: StudentGroup, as: 'group', attributes: ['id', 'groupName'] },
                {
                    model: Answer, as: 'answers', include: [
                        { model: User, as: 'answerer', attributes: ['id', 'fullName', 'role'] }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching questions',
            error: error.message
        });
    }
};

/**
 * @desc    Get single question by ID
 * @route   GET /api/questions/:id
 * @access  Public
 */
exports.getQuestionById = async (req, res) => {
    try {
        const question = await Question.findByPk(req.params.id, {
            include: [
                { model: User, as: 'asker', attributes: ['id', 'fullName', 'email'] },
                { model: StudentGroup, as: 'group', attributes: ['id', 'groupName'] },
                {
                    model: Answer, as: 'answers', include: [
                        { model: User, as: 'answerer', attributes: ['id', 'fullName', 'role'] }
                    ]
                }
            ]
        });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        res.status(200).json({
            success: true,
            data: question
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching question',
            error: error.message
        });
    }
};

/**
 * @desc    Create new question
 * @route   POST /api/questions
 * @access  Private (Student)
 */
exports.createQuestion = async (req, res) => {
    try {
        const { title, content, groupId, askedBy } = req.body;

        const question = await Question.create({
            title,
            content,
            groupId,
            askedBy,
            status: 'WAITING_LECTURER'
        });

        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            data: question
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating question',
            error: error.message
        });
    }
};

/**
 * @desc    Escalate question to Manager
 * @route   PUT /api/questions/:id/escalate
 * @access  Private (Lecturer)
 */
exports.escalateQuestion = async (req, res) => {
    try {
        const question = await Question.findByPk(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        if (question.status === 'RESOLVED') {
            return res.status(400).json({
                success: false,
                message: 'Cannot escalate a resolved question'
            });
        }

        question.status = 'ESCALATED_TO_MANAGER';
        await question.save();

        res.status(200).json({
            success: true,
            message: 'Question escalated to Manager',
            data: question
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error escalating question',
            error: error.message
        });
    }
};

/**
 * @desc    Mark question as resolved
 * @route   PUT /api/questions/:id/resolve
 * @access  Private (Lecturer/Manager)
 */
exports.resolveQuestion = async (req, res) => {
    try {
        const question = await Question.findByPk(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        question.status = 'RESOLVED';
        await question.save();

        res.status(200).json({
            success: true,
            message: 'Question marked as resolved',
            data: question
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error resolving question',
            error: error.message
        });
    }
};

/**
 * @desc    Delete question
 * @route   DELETE /api/questions/:id
 * @access  Private (Admin/Owner)
 */
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByPk(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        await question.destroy();

        res.status(200).json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting question',
            error: error.message
        });
    }
};
