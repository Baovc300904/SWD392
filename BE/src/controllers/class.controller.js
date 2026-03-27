/**
 * Class Controller
 * Handles CRUD operations for classes
 */

const { Class, User, StudentGroup, GroupMember, Task, Question, Submission, Topic } = require('../models');
const { Op } = require('sequelize');
const MSG = require('../constants/messages');

const deriveCurrentActivity = ({ isOnline, openTasks, doneTasks, lastSubmissionAt, lastQuestionAt }) => {
    if (openTasks > 0) {
        return 'Working on assigned tasks';
    }
    if (isOnline && (lastSubmissionAt || lastQuestionAt)) {
        return 'Online and active recently';
    }
    if (doneTasks > 0) {
        return 'Completed tasks recently';
    }
    return isOnline ? 'Online' : 'Offline';
};

/**
 * @desc    Get all classes
 * @route   GET /api/classes
 * @access  Public
 */
const getAllClasses = async (req, res) => {
    try {
        const { lecturerId, search } = req.query;

        let whereClause = {};

        if (lecturerId) whereClause.lecturerId = lecturerId;
        if (search) {
            whereClause.className = { [Op.like]: `%${search}%` };
        }

        const classes = await Class.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'lecturer',
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
            message: MSG.GENERAL.SUCCESS,
            count: classes.length,
            data: classes
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
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
 * @desc    Get class by ID
 * @route   GET /api/classes/:id
 * @access  Public
 */
const getClassById = async (req, res) => {
    try {
        const { id } = req.params;

        const classData = await Class.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'lecturer',
                    attributes: ['id', 'fullName', 'email', 'role']
                },
                {
                    model: StudentGroup,
                    as: 'groups',
                    attributes: ['id', 'groupName', 'topicId']
                }
            ]
        });

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Class not found'
            });
        }

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: classData
        });
    } catch (error) {
        console.error('Error fetching class:', error);
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
 * @desc    Create new class
 * @route   POST /api/classes
 * @access  Lecturer/Admin
 */
const createClass = async (req, res) => {
    try {
        const { lecturerId, className } = req.body;

        if (!lecturerId || !className) {
            return res.status(400).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'Missing lecturerId or className'
            });
        }

        // Verify lecturer exists and is a lecturer
        const lecturer = await User.findByPk(lecturerId);
        if (!lecturer || lecturer.role !== 'lecturer') {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Lecturer not found or invalid role'
            });
        }

        const newClass = await Class.create({
            lecturerId,
            className
        });

        res.status(201).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: newClass
        });
    } catch (error) {
        console.error('Error creating class:', error);
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
 * @desc    Update class
 * @route   PUT /api/classes/:id
 * @access  Lecturer/Admin
 */
const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { className, lecturerId } = req.body;

        const classData = await Class.findByPk(id);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Class not found'
            });
        }

        if (className) classData.className = className;
        if (lecturerId) classData.lecturerId = lecturerId;

        await classData.save();

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: classData
        });
    } catch (error) {
        console.error('Error updating class:', error);
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
 * @desc    Delete class
 * @route   DELETE /api/classes/:id
 * @access  Admin
 */
const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        const classData = await Class.findByPk(id);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Class not found'
            });
        }

        await classData.destroy();

        res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS
        });
    } catch (error) {
        console.error('Error deleting class:', error);
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
 * @desc    Get student activity in a class
 * @route   GET /api/classes/:id/students-activity
 * @access  Lecturer/Manager
 */
const getClassStudentsActivity = async (req, res) => {
    try {
        const classId = Number(req.params.id);
        const requesterId = Number(req.user?.userId || req.user?.id);
        const requesterRole = String(req.user?.role || '').toLowerCase();

        if (!Number.isInteger(classId) || classId <= 0) {
            return res.status(400).json({
                success: false,
                message: MSG.GENERAL.BAD_REQUEST,
                detail: 'Invalid class id'
            });
        }

        if (!['lecturer', 'manager'].includes(requesterRole)) {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN,
                detail: 'Only lecturer or manager can view class student activity'
            });
        }

        const classData = await Class.findByPk(classId, {
            attributes: ['id', 'className', 'lecturerId'],
            include: [{ model: User, as: 'lecturer', attributes: ['id', 'fullName', 'email'] }]
        });

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: MSG.GENERAL.NOT_FOUND,
                detail: 'Class not found'
            });
        }

        if (requesterRole === 'lecturer' && Number(classData.lecturerId) !== requesterId) {
            return res.status(403).json({
                success: false,
                message: MSG.AUTHORIZATION.FORBIDDEN,
                detail: 'You can only view student activity for classes assigned to you'
            });
        }

        const groups = await StudentGroup.findAll({
            where: { classId },
            attributes: ['id', 'groupName', 'groupStatus'],
            include: [{ model: Topic, as: 'topic', attributes: ['id', 'title'] }],
            order: [['id', 'ASC']]
        });

        const groupIds = groups.map((group) => Number(group.id));
        if (groupIds.length === 0) {
            return res.status(200).json({
                success: true,
                message: MSG.GENERAL.SUCCESS,
                data: {
                    class: classData,
                    students: []
                }
            });
        }

        const members = await GroupMember.findAll({
            where: { groupId: { [Op.in]: groupIds } },
            attributes: ['groupId', 'studentId', 'joinedAt'],
            include: [{
                model: User,
                as: 'student',
                attributes: ['id', 'fullName', 'email', 'avatarURL', 'isOnline', 'status', 'lastSeenAt']
            }],
            order: [['joinedAt', 'ASC']]
        });

        const groupLookup = new Map(groups.map((group) => [Number(group.id), group]));
        const studentsMap = new Map();

        for (const member of members) {
            if (!member.student) continue;

            const studentId = Number(member.studentId);
            const group = groupLookup.get(Number(member.groupId));
            if (!group) continue;

            if (!studentsMap.has(studentId)) {
                studentsMap.set(studentId, {
                    user: member.student,
                    groups: []
                });
            }

            studentsMap.get(studentId).groups.push({
                id: group.id,
                groupName: group.groupName,
                groupStatus: group.groupStatus,
                topic: group.topic || null,
                joinedAt: member.joinedAt
            });
        }

        const students = await Promise.all(
            Array.from(studentsMap.values()).map(async ({ user, groups: studentGroups }) => {
                const studentGroupIds = studentGroups.map((group) => Number(group.id));

                const [openTasks, doneTasks, questionsAsked, submissionsCount, latestSubmission, latestQuestion] = await Promise.all([
                    Task.count({ where: { groupId: { [Op.in]: studentGroupIds }, assigneeId: user.id, status: { [Op.ne]: 'DONE' } } }),
                    Task.count({ where: { groupId: { [Op.in]: studentGroupIds }, assigneeId: user.id, status: 'DONE' } }),
                    Question.count({ where: { groupId: { [Op.in]: studentGroupIds }, askedBy: user.id } }),
                    Submission.count({ where: { groupId: { [Op.in]: studentGroupIds }, submittedBy: user.id } }),
                    Submission.findOne({
                        where: { groupId: { [Op.in]: studentGroupIds }, submittedBy: user.id },
                        attributes: ['id', 'milestoneName', 'submittedAt'],
                        order: [['submittedAt', 'DESC']]
                    }),
                    Question.findOne({
                        where: { groupId: { [Op.in]: studentGroupIds }, askedBy: user.id },
                        attributes: ['id', 'title', 'createdAt'],
                        order: [['createdAt', 'DESC']]
                    })
                ]);

                const lastSubmissionAt = latestSubmission?.submittedAt || null;
                const lastQuestionAt = latestQuestion?.createdAt || null;

                return {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    avatarURL: user.avatarURL || null,
                    status: user.status,
                    isOnline: Boolean(user.isOnline),
                    lastSeenAt: user.lastSeenAt,
                    groups: studentGroups,
                    activity: {
                        openTasks,
                        doneTasks,
                        questionsAsked,
                        submissionsCount,
                        lastSubmissionAt,
                        lastQuestionAt,
                        current: deriveCurrentActivity({
                            isOnline: Boolean(user.isOnline),
                            openTasks,
                            doneTasks,
                            lastSubmissionAt,
                            lastQuestionAt
                        })
                    }
                };
            })
        );

        students.sort((a, b) => {
            if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
            return String(a.fullName || '').localeCompare(String(b.fullName || ''));
        });

        return res.status(200).json({
            success: true,
            message: MSG.GENERAL.SUCCESS,
            data: {
                class: classData,
                students
            }
        });
    } catch (error) {
        console.error('Error fetching class student activity:', error);
        return res.status(500).json({
            success: false,
            message: MSG.GENERAL.SERVER_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            errorName: process.env.NODE_ENV === 'development' ? error.name : undefined,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

module.exports = {
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
    getClassStudentsActivity
};
