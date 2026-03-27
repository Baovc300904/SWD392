/**
 * Topic Controller
 * Handles CRUD operations for topics
 */

const { Topic, User, Semester, StudentGroup, GroupMember } = require('../models');
const { Op } = require('sequelize');
const MSG = require('../constants/messages');
const { uploadBuffer } = require('../services/cloudinary.service');

const getRequesterId = (req) => req.user?.userId || req.user?.id;
const getRequesterRole = (req) => String(req.user?.role || '').toLowerCase();
const isCloudinaryStrictMode = () => String(process.env.CLOUDINARY_STRICT || '').toLowerCase() === 'true';
const MAX_TOPICS_PER_SEMESTER = 8;
const COUNTED_TOPIC_STATUSES = ['PENDING', 'APPROVED'];

const deriveFileNameFromUrl = (url) => {
    if (!url) return null;
    try {
        const withoutQuery = String(url).split('?')[0];
        const name = decodeURIComponent(withoutQuery.split('/').pop() || 'syllabus-file');
        return name || 'syllabus-file';
    } catch (_) {
        return 'syllabus-file';
    }
};

const toTopicResponse = (topic) => {
    const syllabusUrl = topic?.syllabusUrl || null;
    return {
        ...topic,
        syllabus: {
            url: syllabusUrl,
            hasFile: Boolean(syllabusUrl),
            fileName: deriveFileNameFromUrl(syllabusUrl)
        }
    };
};

const normalizeTopicTitle = (value) => String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();

const findDuplicateTopicInSemester = async ({ title, semesterId, excludeTopicId = null }) => {
    const where = {
        semesterId
    };

    if (excludeTopicId) {
        where.id = { [Op.ne]: excludeTopicId };
    }

    const candidates = await Topic.findAll({
        where,
        attributes: ['id', 'title']
    });

    const normalizedIncomingTitle = normalizeTopicTitle(title);
    return candidates.find((candidate) => normalizeTopicTitle(candidate.title) === normalizedIncomingTitle) || null;
};

const sendDuplicateTopicResponse = (res, duplicate) =>
    res.status(409).json({
        success: false,
        message: 'Duplicate topic title in semester',
        code: 'TOPIC_TITLE_DUPLICATE',
        detail: `Topic title already exists in this semester (topic #${duplicate.id}).`
    });

const sendTopicLimitWarning = (res, error) => res.status(409).json({
    success: false,
    message: 'Semester topic limit reached',
    code: 'SEMESTER_TOPIC_LIMIT',
    detail: `Semester ${error.semesterId} already has ${error.currentCount}/${MAX_TOPICS_PER_SEMESTER} topics.`,
    warning: {
        title: 'Maximum Topics Reached',
        message: `Each semester supports at most ${MAX_TOPICS_PER_SEMESTER} topics.`,
        semesterId: error.semesterId,
        currentCount: error.currentCount,
        maxTopics: MAX_TOPICS_PER_SEMESTER
    }
});

const resolveSemesterIdForTopic = async (payload) => {
    const explicitSemesterId = Number(payload?.semesterId);
    if (Number.isInteger(explicitSemesterId) && explicitSemesterId > 0) {
        return explicitSemesterId;
    }

    const activeSemester = await Semester.findOne({
        where: { status: 'Active' },
        attributes: ['id']
    });
    return activeSemester ? activeSemester.id : null;
};

const assertSemesterTopicCapacity = async ({ semesterId, excludeTopicId = null }) => {
    const where = {
        semesterId,
        status: { [Op.in]: COUNTED_TOPIC_STATUSES }
    };

    if (excludeTopicId) {
        where.id = { [Op.ne]: excludeTopicId };
    }

    const currentCount = await Topic.count({ where });
    if (currentCount >= MAX_TOPICS_PER_SEMESTER) {
        const error = new Error('Semester topic limit reached');
        error.code = 'SEMESTER_TOPIC_LIMIT';
        error.semesterId = semesterId;
        error.currentCount = currentCount;
        throw error;
    }
};

/**
 * @desc    Get all topics
 * @route   GET /api/topics
 * @access  Public
 */
const getAllTopics = async (req, res) => {
    try {
        const { status, proposedBy, lecturerId, search, semesterId } = req.query;

        let whereClause = {};
        if (status) whereClause.status = status;
        if (proposedBy) whereClause.proposedBy = proposedBy;
        if (lecturerId) whereClause.proposedBy = lecturerId;
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }
        if (semesterId) whereClause.semesterId = Number(semesterId);

        const topics = await Topic.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'proposer',
                    attributes: ['id', 'fullName', 'email', 'role']
                },
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'fullName', 'email', 'role']
                },
                {
                    model: Semester,
                    as: 'semester',
                    attributes: ['id', 'name', 'startDate', 'endDate', 'status']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            count: topics.length,
            data: topics.map((topic) => toTopicResponse(topic.toJSON()))
        });
    } catch (error) {
        console.error('Error fetching topics:', error);
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
 * @desc    Get topic by ID
 * @route   GET /api/topics/:id
 * @access  Public
 */
const getTopicById = async (req, res) => {
    try {
        const { id } = req.params;

        const topic = await Topic.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'proposer',
                    attributes: ['id', 'fullName', 'email', 'role']
                },
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'fullName', 'email', 'role']
                },
                {
                    model: StudentGroup,
                    as: 'groups',
                    attributes: ['id', 'groupName', 'classId', 'topicId', 'createdAt']
                }
            ]
        });

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Topic not found'
            });
        }

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: toTopicResponse(topic.toJSON())
        });
    } catch (error) {
        console.error('Error fetching topic:', error);
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
 * @desc    Create new topic
 * @route   POST /api/topics
 * @access  Lecturer/Admin
 */
const createTopic = async (req, res) => {
    try {
        const { title, description } = req.body;
        let uploadWarning = null;

        // User is already authenticated via middleware; get id from JWT
        const proposedById = req.user?.userId || req.user?.id;
        const semesterId = await resolveSemesterIdForTopic(req.body);

        if (!title) {
            return res.status(400).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'Missing topic title'
            });
        }

        if (!semesterId) {
            return res.status(400).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'Missing semesterId and no active semester found'
            });
        }

        const semester = await Semester.findByPk(semesterId, {
            attributes: ['id', 'status']
        });

        if (!semester) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Semester not found'
            });
        }

        if (semester.status === 'Completed') {
            return res.status(400).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'Cannot add topics to a completed semester'
            });
        }

        const duplicateTopic = await findDuplicateTopicInSemester({
            title,
            semesterId
        });

        if (duplicateTopic) {
            return sendDuplicateTopicResponse(res, duplicateTopic);
        }

        await assertSemesterTopicCapacity({ semesterId });

        if (!proposedById) {
            return res.status(401).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'Unauthorized: could not identify user'
            });
        }

        let syllabusUrl = null;
        if (req.syllabusFile?.buffer) {
            try {
                const uploadResult = await uploadBuffer(req.syllabusFile.buffer, {
                    resource_type: 'raw',
                    original_filename: req.syllabusFile.originalname,
                    mimetype: req.syllabusFile.mimetype
                });
                syllabusUrl = uploadResult?.secure_url || uploadResult?.url || null;
            } catch (uploadError) {
                if (isCloudinaryStrictMode()) {
                    return res.status(502).json({
                        success: false,
                        message: 'Cloudinary upload failed',
                        detail: uploadError.message
                    });
                }
                uploadWarning = 'Syllabus upload failed. Topic was created without uploaded file.';
                console.warn('[createTopic] syllabus upload failed:', uploadError.message);
                if (req.body?.syllabusUrl) {
                    syllabusUrl = String(req.body.syllabusUrl).trim() || null;
                }
            }
        } else if (req.body?.syllabusUrl) {
            syllabusUrl = String(req.body.syllabusUrl).trim();
        }

        const topic = await Topic.create({
            proposedBy: proposedById,
            semesterId,
            title,
            description,
            syllabusUrl,
            status: 'PENDING'
        });

        res.status(201).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            warning: uploadWarning,
            data: toTopicResponse(topic.toJSON())
        });
    } catch (error) {
        if (error.code === 'SEMESTER_TOPIC_LIMIT') {
            return sendTopicLimitWarning(res, error);
        }

        console.error('Error creating topic:', error);
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
 * @desc    Update topic
 * @route   PUT /api/topics/:id
 * @access  Lecturer/Admin
 */
const updateTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        let uploadWarning = null;
        const requesterId = getRequesterId(req);
        const requesterRole = getRequesterRole(req);

        const topic = await Topic.findByPk(id, {
            include: [{ model: Semester, as: 'semester', attributes: ['id', 'status'] }]
        });

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Topic not found'
            });
        }

        // Block modifications for topics in a Completed semester
        if (topic.semester?.status === 'Completed') {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN,
                detail: 'Cannot modify topics from a completed semester (read-only)'
            });
        }

        if (requesterRole === 'lecturer' && Number(topic.proposedBy) !== Number(requesterId)) {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN,
                detail: 'You can only update topics created by you'
            });
        }

        if (requesterRole === 'lecturer' && String(topic.status || '').toUpperCase() === 'APPROVED') {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN,
                detail: 'Approved topics are read-only for lecturers'
            });
        }

        const hasSemesterUpdate = Object.prototype.hasOwnProperty.call(updates, 'semesterId');
        const nextSemesterId = hasSemesterUpdate ? Number(updates.semesterId) : Number(topic.semesterId);
        const nextStatus = String(updates.status || topic.status || '').toUpperCase();
        const hasTitleUpdate = Object.prototype.hasOwnProperty.call(updates, 'title');
        const nextTitle = hasTitleUpdate ? updates.title : topic.title;

        if (!Number.isInteger(nextSemesterId) || nextSemesterId <= 0) {
            return res.status(400).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'Invalid semesterId'
            });
        }

        const nextSemester = await Semester.findByPk(nextSemesterId, {
            attributes: ['id', 'status']
        });

        if (!nextSemester) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Semester not found'
            });
        }

        if (nextSemester.status === 'Completed') {
            return res.status(400).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'Cannot move topic into a completed semester'
            });
        }

        const duplicateTopic = await findDuplicateTopicInSemester({
            title: nextTitle,
            semesterId: nextSemesterId,
            excludeTopicId: Number(topic.id)
        });

        if (duplicateTopic) {
            return sendDuplicateTopicResponse(res, duplicateTopic);
        }

        if (nextStatus !== 'REJECTED') {
            await assertSemesterTopicCapacity({ semesterId: nextSemesterId, excludeTopicId: Number(topic.id) });
        }

        if (req.syllabusFile?.buffer) {
            try {
                const uploadResult = await uploadBuffer(req.syllabusFile.buffer, {
                    resource_type: 'raw',
                    original_filename: req.syllabusFile.originalname,
                    mimetype: req.syllabusFile.mimetype
                });
                updates.syllabusUrl = uploadResult?.secure_url || uploadResult?.url || null;
            } catch (uploadError) {
                if (isCloudinaryStrictMode()) {
                    return res.status(502).json({
                        success: false,
                        message: 'Cloudinary upload failed',
                        detail: uploadError.message
                    });
                }
                uploadWarning = 'Syllabus upload failed. Topic was updated without changing uploaded file.';
                console.warn('[updateTopic] syllabus upload failed:', uploadError.message);
                if (Object.prototype.hasOwnProperty.call(updates, 'syllabusUrl')) {
                    updates.syllabusUrl = String(updates.syllabusUrl || '').trim() || null;
                } else {
                    delete updates.syllabusUrl;
                }
            }
        } else if (Object.prototype.hasOwnProperty.call(updates, 'syllabusUrl')) {
            updates.syllabusUrl = String(updates.syllabusUrl || '').trim() || null;
        }

        await topic.update(updates);

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            warning: uploadWarning,
            data: toTopicResponse(topic.toJSON())
        });
    } catch (error) {
        if (error.code === 'SEMESTER_TOPIC_LIMIT') {
            return sendTopicLimitWarning(res, error);
        }

        console.error('Error updating topic:', error);
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
 * @desc    Delete topic
 * @route   DELETE /api/topics/:id
 * @access  Lecturer/Admin
 */
const deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterId = getRequesterId(req);
        const requesterRole = getRequesterRole(req);

        const topic = await Topic.findByPk(id, {
            include: [{ model: Semester, as: 'semester', attributes: ['id', 'status'] }]
        });

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Topic not found'
            });
        }

        // Block deletion for topics in a Completed semester
        if (topic.semester?.status === 'Completed') {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN,
                detail: 'Cannot delete topics from a completed semester (read-only)'
            });
        }

        if (requesterRole === 'lecturer' && Number(topic.proposedBy) !== Number(requesterId)) {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN,
                detail: 'You can only delete topics created by you'
            });
        }

        await topic.destroy();

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS
        });
    } catch (error) {
        console.error('Error deleting topic:', error);
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
 * @desc    Approve topic
 * @route   PUT /api/topics/:id/approve
 * @access  Admin
 */
const approveTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterId = getRequesterId(req);

        const topic = await Topic.findByPk(id);

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Topic not found'
            });
        }

        if (!topic.semesterId) {
            return res.status(400).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'Topic must belong to a semester before approval'
            });
        }

        await assertSemesterTopicCapacity({
            semesterId: Number(topic.semesterId),
            excludeTopicId: Number(topic.id)
        });

        topic.status = 'APPROVED';
        topic.approvedBy = requesterId || topic.approvedBy;
        await topic.save();
        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: toTopicResponse(topic.toJSON())
        });
    } catch (error) {
        if (error.code === 'SEMESTER_TOPIC_LIMIT') {
            return sendTopicLimitWarning(res, error);
        }

        console.error('Error approving topic:', error);
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
 * @desc    Reject topic
 * @route   PUT /api/topics/:id/reject
 * @access  Admin
 */
const rejectTopic = async (req, res) => {
    try {
        const { id } = req.params;

        const topic = await Topic.findByPk(id);

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Topic not found'
            });
        }

        topic.status = 'REJECTED';
        await topic.save();
        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: toTopicResponse(topic.toJSON())
        });
    } catch (error) {
        console.error('Error rejecting topic:', error);
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
 * @desc    Group register a topic (chỉ thành viên trong nhóm mới được đăng ký)
 * @route   POST /api/topics/:id/register
 * @access  Student
 */
const registerTopicForGroup = async (req, res) => {
    try {
        const topicId = req.params.id;
        const { groupId } = req.body;
        const userId = req.user.userId || req.user.id;

        // Kiểm tra tồn tại group và topic
        const group = await StudentGroup.findByPk(groupId);
        if (!group) return res.status(404).json({ success: false, message: MSG.GENERAL.NOT_FOUND, detail: 'Group not found' });

        const topic = await Topic.findByPk(topicId);
        if (!topic) return res.status(404).json({ success: false, message: MSG.GENERAL.NOT_FOUND, detail: 'Topic not found' });

        // Kiểm tra user có phải thành viên của group không
        const isMember = await GroupMember.findOne({ where: { groupId: group.id, studentId: userId } });
        if (!isMember) {
            return res.status(403).json({ success: false, message: MSG.GENERAL.BAD_REQUEST, detail: 'Only group members can register topic for this group' });
        }

        // Kiểm tra trạng thái đề tài phải là APPROVED
        if (topic.status !== 'APPROVED') {
            return res.status(400).json({ success: false, message: MSG.GENERAL.BAD_REQUEST, detail: 'Topic is not approved for registration' });
        }

        // Kiểm tra nhóm đã đăng ký đề tài chưa
        if (group.topicId) {
            return res.status(400).json({ success: false, message: MSG.GENERAL.BAD_REQUEST, detail: 'Group already registered a topic' });
        }

        // Gán topic cho group
        group.topicId = topicId;
        await group.save();

        res.json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: { groupId: group.id, topicId }
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

module.exports = {
    getAllTopics,
    getTopicById,
    createTopic,
    updateTopic,
    deleteTopic,
    approveTopic,
    rejectTopic,
    registerTopicForGroup
};
