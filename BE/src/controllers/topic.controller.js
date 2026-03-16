/**
 * Topic Controller
 * Handles CRUD operations for topics
 */

const { Topic, User, StudentGroup } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get all topics
 * @route   GET /api/topics
 * @access  Public
 */
const getAllTopics = async (req, res) => {
    try {
        const { status, proposedBy, search } = req.query;

        let whereClause = {};

        if (status) whereClause.status = status;
        if (proposedBy) whereClause.proposedBy = proposedBy;
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

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
                    model: StudentGroup,
                    as: 'groups',
                    attributes: ['id', 'groupName']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: topics.length,
            data: topics
        });
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching topics',
            error: error.message
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
                    as: 'creator',
                    attributes: ['userId', 'fullName', 'email', 'avatarURL', 'role']
                },
                {
                    model: StudentGroup,
                    as: 'groups',
                    attributes: ['id', 'groupName', 'status', 'maxMembers']
                }
            ]
        });

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Topic not found'
            });
        }

        res.status(200).json({
            success: true,
            data: topic
        });
    } catch (error) {
        console.error('Error fetching topic:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching topic',
            error: error.message
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
        const { title, description, descriptionFile } = req.body;

        // User is already authenticated via middleware; get id from JWT
        const proposedById = req.user?.userId || req.user?.id;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title'
            });
        }

        if (!proposedById) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: could not identify user'
            });
        }

        const topic = await Topic.create({
            proposedBy: proposedById,
            title,
            description,
            descriptionFile,
            status: 'PENDING'
        });

        res.status(201).json({
            success: true,
            message: 'Topic created successfully',
            data: topic
        });
    } catch (error) {
        console.error('Error creating topic:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating topic',
            error: error.message
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
        const updates = req.body;

        const topic = await Topic.findByPk(id);

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Topic not found'
            });
        }

        await topic.update(updates);

        res.status(200).json({
            success: true,
            message: 'Topic updated successfully',
            data: topic
        });
    } catch (error) {
        console.error('Error updating topic:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating topic',
            error: error.message
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

        const topic = await Topic.findByPk(id);

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Topic not found'
            });
        }

        await topic.destroy();

        res.status(200).json({
            success: true,
            message: 'Topic deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting topic:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting topic',
            error: error.message
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

        const topic = await Topic.findByPk(id);

        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Topic not found'
            });
        }

        topic.status = 'APPROVED';
        await topic.save();

        res.status(200).json({
            success: true,
            message: 'Topic approved successfully',
            data: topic
        });
    } catch (error) {
        console.error('Error approving topic:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving topic',
            error: error.message
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
                message: 'Topic not found'
            });
        }

        topic.status = 'REJECTED';
        await topic.save();

        res.status(200).json({
            success: true,
            message: 'Topic rejected successfully',
            data: topic
        });
    } catch (error) {
        console.error('Error rejecting topic:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting topic',
            error: error.message
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
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

        const topic = await Topic.findByPk(topicId);
        if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

        // Kiểm tra user có phải thành viên của group không
        const isMember = await GroupMember.findOne({ where: { groupId: group.id, studentId: userId } });
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'Only group members can register topic for this group' });
        }

        // Kiểm tra nhóm đã đăng ký đề tài chưa
        if (group.topicId) {
            return res.status(400).json({ success: false, message: 'Group already registered a topic' });
        }

        // Gán topic cho group
        group.topicId = topicId;
        await group.save();

        res.json({
            success: true,
            message: 'Group registered topic successfully',
            data: { groupId: group.id, topicId }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
