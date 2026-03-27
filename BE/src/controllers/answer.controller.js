/**
 * Answer Controller
 * Handles answers to Q&A questions
 */

const { Answer, Question, User, GroupMember, StudentGroup, Class } = require('../models');
const MSG = require('../constants/messages');
const pushService = require('../services/push.service');
const {
    isPrivilegedRole,
    buildStudentVisibilityScope,
    canStudentViewQuestion,
    canStudentViewAnswer
} = require('../utils/qa-visibility');

const getRequesterId = (req) => req.user?.userId || req.user?.id;
const getRequesterRole = (req) => String(req.user?.role || '').toLowerCase();

const trimForNotification = (text, maxLength = 120) => {
    const normalized = String(text || '').trim().replace(/\s+/g, ' ');
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength - 1)}…`;
};

const withVisibilityMeta = (answer) => {
    const isPublic = Boolean(answer?.isPublic);
    return {
        ...answer,
        visibility: {
            value: isPublic ? 'PUBLIC' : 'PRIVATE',
            label: isPublic ? 'Public' : 'Private',
            badgeTone: isPublic ? 'success' : 'muted'
        }
    };
};

const notifyQuestionAskerOnAnswer = async ({ question, answer, requesterRole }) => {
    if (!question?.askedBy || !answer?.id) return;

    // Skip self-notification in unexpected data states.
    if (Number(question.askedBy) === Number(answer.answeredBy)) return;

    const asker = await User.findByPk(question.askedBy, {
        attributes: ['id', 'fcmToken']
    });

    if (!asker?.fcmToken) {
        console.warn(`⚠️ Skip answer notification: user #${question.askedBy} has no fcmToken`);
        return;
    }

    const actorLabel = requesterRole === 'lecturer' ? 'Giảng viên' : 'Quản lý';
    const preview = trimForNotification(answer.content, 100);

    const result = await pushService.sendQuestionAnsweredToStudent({
        token: asker.fcmToken,
        questionId: question.id,
        answerId: answer.id,
        actorRole: requesterRole,
        answerPreview: preview
    });

    if (!result.success) {
        console.warn(
            `⚠️ Failed to send answer notification for question #${question.id} to user #${asker.id}: ${result.reason || result.error || result.code || 'unknown error'}`
        );
    }
};

/**
 * @desc    Get all answers for a question
 * @route   GET /api/questions/:questionId/answers
 * @access  Public
 */
exports.getAnswersByQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const userId = getRequesterId(req);
        const userRole = getRequesterRole(req);

        const question = await Question.findByPk(questionId, {
            attributes: ['id', 'groupId', 'askedBy', 'isPublic'],
            include: [{
                model: StudentGroup,
                as: 'group',
                attributes: ['id', 'topicId']
            }]
        });

        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        if (!isPrivilegedRole(userRole) && userRole !== 'student') {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN,
                detail: 'You cannot view answers for this question'
            });
        }

        let studentScope = null;
        if (userRole === 'student') {
            const memberships = await GroupMember.findAll({
                where: { studentId: userId },
                attributes: ['groupId'],
                include: [{
                    model: StudentGroup,
                    as: 'group',
                    attributes: ['id', 'topicId']
                }]
            });

            studentScope = buildStudentVisibilityScope(memberships);

            const canSeeQuestion = canStudentViewQuestion({
                questionIsPublic: Boolean(question.isPublic),
                askingGroupId: question.groupId,
                askingTopicId: question.group?.topicId,
                studentScope
            });

            if (!canSeeQuestion) {
                return res.status(403).json({
                    success: false,
                    message: MSG.AUTHORIZATION.FORBIDDEN,
                    detail: 'You cannot view answers for this question'
                });
            }
        }

        const answers = await Answer.findAll({
            where: { questionId },
            include: [
                { model: User, as: 'answerer', attributes: ['id', 'fullName', 'role'] }
            ],
            order: [['createdAt', 'ASC']]
        });

        const filteredAnswers = userRole === 'student'
            ? answers.filter((answer) => canStudentViewAnswer({
                answerIsPublic: Boolean(answer.isPublic),
                askingGroupId: question.groupId,
                askingTopicId: question.group?.topicId,
                studentScope
            }))
            : answers;

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            count: filteredAnswers.length,
            data: filteredAnswers.map((answer) => withVisibilityMeta(answer.toJSON()))
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
        const { content, isPublic = false } = req.body;
        const answeredBy = getRequesterId(req);
        const requesterRole = getRequesterRole(req);

        // Check if question exists
        const question = await Question.findByPk(questionId, {
            include: [{
                model: StudentGroup,
                as: 'group',
                include: [{ model: Class, as: 'class', attributes: ['lecturerId'] }]
            }]
        });
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        if (requesterRole === 'lecturer' && Number(question.group?.class?.lecturerId) !== Number(answeredBy)) {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN,
                detail: 'You can only answer questions from your classes'
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

        // Best-effort push notification so the asker knows their question was answered.
        await notifyQuestionAskerOnAnswer({
            question,
            answer,
            requesterRole
        });

        res.status(201).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: withVisibilityMeta(answer.toJSON())
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
        const requesterId = getRequesterId(req);
        const requesterRole = getRequesterRole(req);

        const answer = await Answer.findByPk(req.params.id);

        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        if (requesterRole !== 'manager' && Number(answer.answeredBy) !== Number(requesterId)) {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN
            });
        }

        if (content !== undefined) answer.content = content;
        if (isPublic !== undefined) answer.isPublic = isPublic;

        await answer.save();

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: withVisibilityMeta(answer.toJSON())
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
        const requesterId = getRequesterId(req);
        const requesterRole = getRequesterRole(req);

        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        if (requesterRole !== 'manager' && Number(answer.answeredBy) !== Number(requesterId)) {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN
            });
        }

        answer.isPublic = !answer.isPublic;
        await answer.save();

        res.status(200).json({
            success: true,
            message: `Answer is now ${answer.isPublic ? 'public' : 'private'}`,
            data: withVisibilityMeta(answer.toJSON())
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
        const requesterId = getRequesterId(req);
        const requesterRole = getRequesterRole(req);

        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        if (requesterRole !== 'manager' && Number(answer.answeredBy) !== Number(requesterId)) {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN
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
        const userRole = getRequesterRole(req);
        const userId = getRequesterId(req);
        let studentScope = null;

        if (userRole === 'student') {
            const memberships = await GroupMember.findAll({
                where: { studentId: userId },
                attributes: ['groupId'],
                include: [{
                    model: StudentGroup,
                    as: 'group',
                    attributes: ['id', 'topicId']
                }]
            });

            studentScope = buildStudentVisibilityScope(memberships);
        }

        let answers = await Answer.findAll({
            where: { isPublic: true },
            include: [
                {
                    model: Question,
                    as: 'question',
                    attributes: ['id', 'title', 'content', 'groupId'],
                    include: [{
                        model: StudentGroup,
                        as: 'group',
                        attributes: ['id', 'topicId']
                    }]
                },
                {
                    model: User,
                    as: 'answerer',
                    attributes: ['id', 'fullName', 'role']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        if (userRole === 'student') {
            answers = answers.filter((answer) => canStudentViewAnswer({
                answerIsPublic: true,
                askingGroupId: answer.question?.groupId,
                askingTopicId: answer.question?.group?.topicId,
                studentScope
            }));
        }

        res.status(200).json({
            success: true,
            count: answers.length,
            data: answers.map((answer) => withVisibilityMeta(answer.toJSON()))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching public answers',
            error: error.message
        });
    }
};
