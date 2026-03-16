/**
 * Submission Controller
 * Handles CRUD and grading operations for submissions
 */

const { Submission, StudentGroup, User } = require('../models');
const { Op } = require('sequelize');
const MSG = require('../constants/messages');

const includeConfig = [
    {
        model: StudentGroup,
        as: 'group',
        attributes: ['id', 'groupName', 'classId', 'topicId']
    },
    {
        model: User,
        as: 'submitter',
        attributes: ['id', 'fullName', 'email', 'role']
    },
    {
        model: User,
        as: 'grader',
        attributes: ['id', 'fullName', 'email', 'role']
    }
];

const getAllSubmissions = async (req, res) => {
    try {
        const { groupId, submittedBy, status, gradedBy, search, page = 1, limit = 20 } = req.query;
        const whereClause = {};

        if (groupId) whereClause.groupId = groupId;
        if (submittedBy) whereClause.submittedBy = submittedBy;
        if (status) whereClause.status = String(status).toUpperCase();
        if (gradedBy) whereClause.gradedBy = gradedBy;
        if (search) {
            whereClause[Op.or] = [
                { milestoneName: { [Op.like]: `%${search}%` } },
                { notes: { [Op.like]: `%${search}%` } },
                { feedback: { [Op.like]: `%${search}%` } }
            ];
        }

        const parsedPage = Math.max(Number(page) || 1, 1);
        const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
        const offset = (parsedPage - 1) * parsedLimit;

        const { rows, count } = await Submission.findAndCountAll({
            where: whereClause,
            include: includeConfig,
            order: [['submittedAt', 'DESC']],
            limit: parsedLimit,
            offset
        });

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            count,
            page: parsedPage,
            limit: parsedLimit,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            errorName: process.env.NODE_ENV === 'development' ? error.name : undefined,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await Submission.findByPk(id, { include: includeConfig });

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Submission not found'
            });
        }

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: submission
        });
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            errorName: process.env.NODE_ENV === 'development' ? error.name : undefined,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const createSubmission = async (req, res) => {
    try {
        const { groupId, milestoneName, fileUrl, filePath, notes } = req.body;
        const submittedBy = req.user?.userId;

        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'Missing groupId'
            });
        }

        if (!fileUrl && !filePath) {
            return res.status(400).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'Missing fileUrl or filePath'
            });
        }

        const group = await StudentGroup.findByPk(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Group not found'
            });
        }

        const submission = await Submission.create({
            groupId,
            submittedBy,
            milestoneName,
            fileUrl,
            filePath,
            notes,
            status: 'SUBMITTED'
        });

        const created = await Submission.findByPk(submission.id, { include: includeConfig });

        res.status(201).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: created
        });
    } catch (error) {
        console.error('Error creating submission:', error);
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            errorName: process.env.NODE_ENV === 'development' ? error.name : undefined,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const updateSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { milestoneName, fileUrl, filePath, notes } = req.body;
        const requesterId = req.user?.userId;
        const requesterRole = String(req.user?.role || '').toLowerCase();

        const submission = await Submission.findByPk(id);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Submission not found'
            });
        }

        if (requesterRole === 'student' && Number(submission.submittedBy) !== Number(requesterId)) {
            return res.status(403).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'You can only update your own submission'
            });
        }

        if (milestoneName !== undefined) submission.milestoneName = milestoneName;
        if (fileUrl !== undefined) submission.fileUrl = fileUrl;
        if (filePath !== undefined) submission.filePath = filePath;
        if (notes !== undefined) submission.notes = notes;

        await submission.save();

        const updated = await Submission.findByPk(id, { include: includeConfig });

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: updated
        });
    } catch (error) {
        console.error('Error updating submission:', error);
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            errorName: process.env.NODE_ENV === 'development' ? error.name : undefined,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const deleteSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterId = req.user?.userId;
        const requesterRole = String(req.user?.role || '').toLowerCase();

        const submission = await Submission.findByPk(id);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Submission not found'
            });
        }

        if (requesterRole === 'student' && Number(submission.submittedBy) !== Number(requesterId)) {
            return res.status(403).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'You can only delete your own submission'
            });
        }

        await submission.destroy();

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS
        });
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            errorName: process.env.NODE_ENV === 'development' ? error.name : undefined,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const gradeSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { grade, feedback } = req.body;
        const gradedBy = req.user?.userId;

        if (grade === undefined || grade === null || Number.isNaN(Number(grade))) {
            return res.status(400).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'Missing or invalid grade'
            });
        }

        const normalizedGrade = Number(grade);
        if (normalizedGrade < 0 || normalizedGrade > 10) {
            return res.status(400).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'Grade must be between 0 and 10'
            });
        }

        const submission = await Submission.findByPk(id);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Submission not found'
            });
        }

        submission.grade = normalizedGrade;
        submission.feedback = feedback || null;
        submission.gradedBy = gradedBy;
        submission.gradedAt = new Date();
        submission.status = 'GRADED';

        await submission.save();

        const graded = await Submission.findByPk(id, { include: includeConfig });

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: graded
        });
    } catch (error) {
        console.error('Error grading submission:', error);
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
    getAllSubmissions,
    getSubmissionById,
    createSubmission,
    updateSubmission,
    deleteSubmission,
    gradeSubmission
};
