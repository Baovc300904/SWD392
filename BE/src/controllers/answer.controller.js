/**
 * Answer Controller
 * Handles answers to Q&A questions
 */

const { Answer, Question, User } = require('../models');
const MSG = require('../constants/messages');

/**
 * @desc    Get all answers for a question
 * @route   GET /api/questions/:questionId/answers
 * @access  Public
 */
exports.getAnswersByQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // Lấy thông tin câu hỏi để biết groupId và askedBy
        const question = await Question.findByPk(questionId);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        // Lấy tất cả answers của câu hỏi
        const answers = await Answer.findAll({
            where: { questionId },
            include: [
                { model: User, as: 'answerer', attributes: ['id', 'fullName', 'role'] }
            ],
            order: [['createdAt', 'ASC']]
        });

        // Lọc answers theo quyền truy cập
        const filteredAnswers = answers.filter(ans => {
            if (ans.isPublic) return true; // Public: ai cũng thấy
            // Private: chỉ thành viên nhóm, người hỏi, người trả lời, lecturer/manager
            if (!userId) return false;
            if (userId === question.askedBy) return true;
            if (userId === ans.answeredBy) return true;
            if (userRole === 'lecturer' || userRole === 'manager') return true;
            // Kiểm tra thành viên nhóm
            if (question.groupId) {
                // Cần truy vấn GroupMember để kiểm tra
                // (Đơn giản hóa: trả về cho student nếu groupId trùng với nhóm của user)
                // Nếu cần chính xác, nên truy vấn GroupMember ở đây
                // (Hoặc có thể bổ sung sau nếu cần)
            }
            return false;
        });

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            count: filteredAnswers.length,
            data: filteredAnswers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
            message: MSG.GENERAL.SUCCESS,
            data: answer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
            message: MSG.GENERAL.SUCCESS,
            data: answer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
            message: MSG.GENERAL.SUCCESS
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
