/**
 * Question Controller
 * Handles Q&A questions with hierarchical escalation
 */

const { Op } = require('sequelize');
const { Question, QuestionDraft, User, StudentGroup, Answer, Class, GroupMember, Topic } = require('../models');
const MSG = require('../constants/messages');
const {
    isPrivilegedRole,
    buildStudentVisibilityScope,
    canStudentViewQuestion
} = require('../utils/qa-visibility');

const getRequesterId = (req) => req.user?.userId || req.user?.id;
const getRequesterRole = (req) => String(req.user?.role || '').toLowerCase();
const questionService = require("../services/question.service");

const withVisibilityMeta = (question) => {
    const isPublic = Boolean(question?.isPublic);
    return {
        ...question,
        visibility: {
            value: isPublic ? 'PUBLIC' : 'PRIVATE',
            label: isPublic ? 'Public' : 'Private',
            badgeTone: isPublic ? 'success' : 'muted'
        }
    };
};

/**
 * @desc    Generate AI draft for question
 * @route   POST /api/questions/:id/drafts/generate
 * @access  Private (Lecturer/Manager)
 */
exports.generateDraft = async (req, res) => {
    try {
        const { id } = req.params;
        const lecturerId = getRequesterId(req) || 1;
        const requesterRole = getRequesterRole(req);

        if (!['lecturer', 'manager', 'admin'].includes(requesterRole)) {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN,
                detail: 'Only lecturer/manager/admin can generate AI draft'
            });
        }

        const draft = await questionService.generateDraftForQuestion(id, lecturerId);

        return res.status(201).json({
            success: true,
            message: "AI draft generated successfully",
            data: draft
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || MSG.GENERAL.SERVER_ERROR
        });
    }
};

/**
 * @desc    Get all questions (with filters)
 * @route   GET /api/questions
 * @access  Public
 */
exports.getAllQuestions = async (req, res) => {
    try {
        const { status, groupId, lecturerId } = req.query;
        const requesterId = getRequesterId(req);
        const requesterRole = getRequesterRole(req);
        let studentScope = null;

        const where = {};
        const classWhere = {};
        if (status) where.status = status;
        if (groupId) where.groupId = groupId;
        if (lecturerId) classWhere.lecturerId = lecturerId;
        if (requesterRole === 'lecturer' && !lecturerId) {
            classWhere.lecturerId = requesterId;
        }

        if (requesterRole === 'student') {
            const memberships = await GroupMember.findAll({
                where: { studentId: requesterId },
                attributes: ['groupId'],
                include: [{
                    model: StudentGroup,
                    as: 'group',
                    attributes: ['id', 'topicId']
                }]
            });
            studentScope = buildStudentVisibilityScope(memberships);
        }

        let questions = await Question.findAll({
            where,
            include: [
                { model: User, as: 'asker', attributes: ['id', 'fullName', 'email', 'avatarURL'] },
                {
                    model: StudentGroup,
                    as: 'group',
                    attributes: ['id', 'groupName', 'classId', 'topicId'],
                    required: Object.keys(classWhere).length > 0,
                    include: [{
                        model: Class,
                        as: 'class',
                        attributes: ['id', 'className', 'lecturerId'],
                        where: Object.keys(classWhere).length > 0 ? classWhere : undefined,
                        required: Object.keys(classWhere).length > 0
                    }]
                },
                {
                    model: Answer, as: 'answers', include: [
                        { model: User, as: 'answerer', attributes: ['id', 'fullName', 'role', 'avatarURL'] }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        if (requesterRole === 'student') {
            questions = questions.filter((question) => canStudentViewQuestion({
                questionIsPublic: Boolean(question.isPublic),
                askingGroupId: question.groupId,
                askingTopicId: question.group?.topicId,
                studentScope
            }));
        }

        if (!isPrivilegedRole(requesterRole) && requesterRole !== 'student') {
            questions = [];
        }

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            count: questions.length,
            data: questions.map((question) => withVisibilityMeta(question.toJSON()))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            errorName: process.env.NODE_ENV === 'development' ? error.name : undefined,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        const requesterId = getRequesterId(req);
        const requesterRole = getRequesterRole(req);
        const question = await Question.findByPk(req.params.id, {
            include: [
                { model: User, as: 'asker', attributes: ['id', 'fullName', 'email', 'avatarURL'] },
                { model: StudentGroup, as: 'group', attributes: ['id', 'groupName', 'topicId'] },
                {
                    model: QuestionDraft,
                    as: 'drafts',
                    include: [
                        { model: User, as: 'lecturer', attributes: ['id', 'fullName', 'email', 'avatarURL'] }
                    ]
                },
                {
                    model: Answer,
                    as: 'answers',
                    include: [
                        { model: User, as: 'answerer', attributes: ['id', 'fullName', 'role', 'avatarURL'] }
                    ]
                }
            ],
            order: [
                [{ model: QuestionDraft, as: 'drafts' }, 'createdAt', 'DESC'],
                [{ model: Answer, as: 'answers' }, 'createdAt', 'ASC']
            ]
        });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Question not found'
            });
        }

        if (requesterRole === 'student') {
            const memberships = await GroupMember.findAll({
                where: { studentId: requesterId },
                attributes: ['groupId'],
                include: [{
                    model: StudentGroup,
                    as: 'group',
                    attributes: ['id', 'topicId']
                }]
            });

            const studentScope = buildStudentVisibilityScope(memberships);
            const allowed = canStudentViewQuestion({
                questionIsPublic: Boolean(question.isPublic),
                askingGroupId: question.groupId,
                askingTopicId: question.group?.topicId,
                studentScope
            });

            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message: MSG.AUTHORIZATION.FORBIDDEN,
                    detail: 'You cannot view this question'
                });
            }
        }

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: withVisibilityMeta(question.toJSON())
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            errorName: process.env.NODE_ENV === 'development' ? error.name : undefined,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        const { title, content, groupId, isPublic = false } = req.body;
        const askedBy = getRequesterId(req);

        const membership = await GroupMember.findOne({
            where: { groupId, studentId: askedBy }
        });
        if (!membership) {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN,
                detail: 'You can only ask questions for your own groups'
            });
        }

        const question = await Question.create({
            title,
            content,
            groupId,
            askedBy,
            isPublic: Boolean(isPublic),
            status: 'WAITING_LECTURER'
        });

        res.status(201).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: withVisibilityMeta(question.toJSON())
        });
    } catch (error) {
        console.error('[createQuestion] Error:', error.name, error.message, error.parent?.message);
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            errorName: process.env.NODE_ENV === 'development' ? error.name : undefined,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        const lecturerId = getRequesterId(req);
        const question = await Question.findByPk(req.params.id, {
            include: [{
                model: StudentGroup,
                as: 'group',
                include: [{
                    model: Class,
                    as: 'class',
                    attributes: ['lecturerId']
                }]
            }]
        });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Question not found'
            });
        }

        if (question.status === 'RESOLVED') {
            return res.status(400).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'Cannot escalate a resolved question'
            });
        }

        if (Number(question.group?.class?.lecturerId) !== Number(lecturerId)) {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN,
                detail: 'You can only escalate questions from your classes'
            });
        }

        question.status = 'ESCALATED_TO_MANAGER';
        await question.save();

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: question
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            errorName: process.env.NODE_ENV === 'development' ? error.name : undefined,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * @desc    Ask AI for draft answer
 * @route   POST /api/questions/:id/ask-ai
 * @access  Private (Lecturer/Manager)
 */
exports.askAIForQuestion = async (req, res) => {
    try {
        const requesterRole = getRequesterRole(req);
        const requesterId = getRequesterId(req);
        const question = await Question.findByPk(req.params.id, {
            include: [{
                model: StudentGroup,
                as: 'group',
                include: [
                    { model: Class, as: 'class', attributes: ['lecturerId', 'className'] },
                    { model: Topic, as: 'topic', attributes: ['title', 'description'] }
                ]
            }]
        });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Question not found'
            });
        }

        if (requesterRole === 'lecturer' && Number(question.group?.class?.lecturerId) !== Number(requesterId)) {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN,
                detail: 'You can only ask AI for questions from your classes'
            });
        }

        const draft = await questionService.generateDraftForQuestion(req.params.id, requesterId);

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: {
                id: draft.id,
                questionId: draft.questionId,
                lecturerId: draft.lecturerId,
                draft: draft.draft,
                createdAt: draft.createdAt,
                updatedAt: draft.updatedAt
            }
        });
    } catch (error) {
        const status = Number(error?.status || error?.response?.status || 0);
        const message = String(error?.message || '').toLowerCase();

        if (status === 429 || message.includes('quota') || message.includes('resource_exhausted')) {
            return res.status(429).json({
                success: false,
                message: 'AI quota exceeded. Vui lòng thử lại sau.',
                detail: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        if (status === 401 || message.includes('api key')) {
            return res.status(400).json({
                success: false,
                message: 'AI key backend chưa cấu hình đúng.',
                detail: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        console.error('[askAIForQuestion] Error:', error.name, error.message);
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            detail: error.message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        const requesterRole = getRequesterRole(req);
        const requesterId = getRequesterId(req);
        const question = await Question.findByPk(req.params.id, {
            include: [{
                model: StudentGroup,
                as: 'group',
                include: [{
                    model: Class,
                    as: 'class',
                    attributes: ['lecturerId']
                }]
            }]
        });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Question not found'
            });
        }

        if (requesterRole === 'lecturer' && Number(question.group?.class?.lecturerId) !== Number(requesterId)) {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN,
                detail: 'You can only resolve questions from your classes'
            });
        }

        question.status = 'RESOLVED';
        await question.save();

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: question
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            errorName: process.env.NODE_ENV === 'development' ? error.name : undefined,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        const requesterId = getRequesterId(req);
        const requesterRole = getRequesterRole(req);
        const question = await Question.findByPk(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Question not found'
            });
        }

        if (requesterRole === 'student' && Number(question.askedBy) !== Number(requesterId)) {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN,
                detail: 'You can only delete your own questions'
            });
        }

        await Answer.destroy({ where: { questionId: question.id } });
        await QuestionDraft.destroy({ where: { questionId: question.id } });

        await question.destroy();

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            errorName: process.env.NODE_ENV === 'development' ? error.name : undefined,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
