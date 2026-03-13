/**
 * Task Controller
 * Handles CRUD operations for task board items
 */

const { Task, StudentGroup, User } = require('../models');
const { Op } = require('sequelize');

const parseTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.filter(Boolean).map((tag) => String(tag).trim()).filter(Boolean);
    if (typeof tags === 'string') {
        try {
            const parsed = JSON.parse(tags);
            if (Array.isArray(parsed)) {
                return parsed.filter(Boolean).map((tag) => String(tag).trim()).filter(Boolean);
            }
        } catch (_) {
            return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
        }
    }
    return [];
};

const normalizePriority = (priority = 'MEDIUM') => {
    const value = String(priority || '').toUpperCase();
    return ['LOW', 'MEDIUM', 'HIGH'].includes(value) ? value : 'MEDIUM';
};

const normalizeStatus = (status = 'TODO') => {
    const value = String(status || '').toUpperCase();
    return ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].includes(value) ? value : 'TODO';
};

const formatTask = (task) => {
    const plain = task.toJSON ? task.toJSON() : task;
    return {
        ...plain,
        tags: parseTags(plain.tags)
    };
};

const includeConfig = [
    {
        model: StudentGroup,
        as: 'group',
        attributes: ['id', 'groupName']
    },
    {
        model: User,
        as: 'creator',
        attributes: ['id', 'fullName', 'email', 'avatarURL']
    },
    {
        model: User,
        as: 'assignee',
        attributes: ['id', 'fullName', 'email', 'avatarURL']
    }
];

const getAllTasks = async (req, res) => {
    try {
        const { groupId, status, priority, assigneeId, search } = req.query;
        const whereClause = {};

        if (groupId) whereClause.groupId = groupId;
        if (status) whereClause.status = normalizeStatus(status);
        if (priority) whereClause.priority = normalizePriority(priority);
        if (assigneeId) whereClause.assigneeId = assigneeId;
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const tasks = await Task.findAll({
            where: whereClause,
            include: includeConfig,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks.map(formatTask)
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks',
            error: error.message
        });
    }
};

const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByPk(id, { include: includeConfig });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: formatTask(task)
        });
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching task',
            error: error.message
        });
    }
};

const createTask = async (req, res) => {
    try {
        const { groupId, assigneeId, title, description, priority, status, tags, dueDate } = req.body;
        const createdBy = req.user?.userId;

        if (!groupId || !title) {
            return res.status(400).json({
                success: false,
                message: 'Please provide groupId and title'
            });
        }

        const group = await StudentGroup.findByPk(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const task = await Task.create({
            groupId,
            createdBy,
            assigneeId: assigneeId || null,
            title: String(title).trim(),
            description: description || null,
            priority: normalizePriority(priority),
            status: normalizeStatus(status),
            tags: JSON.stringify(parseTags(tags)),
            dueDate: dueDate || null
        });

        const created = await Task.findByPk(task.id, { include: includeConfig });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: formatTask(created)
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating task',
            error: error.message
        });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { assigneeId, title, description, priority, status, tags, dueDate } = req.body;
        const requesterId = req.user?.userId;
        const requesterRole = String(req.user?.role || '').toLowerCase();

        const task = await Task.findByPk(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        if (requesterRole === 'student' && Number(task.createdBy) !== Number(requesterId)) {
            return res.status(403).json({
                success: false,
                message: 'You can only update tasks created by you'
            });
        }

        if (assigneeId !== undefined) task.assigneeId = assigneeId || null;
        if (title !== undefined) task.title = String(title).trim();
        if (description !== undefined) task.description = description || null;
        if (priority !== undefined) task.priority = normalizePriority(priority);
        if (status !== undefined) task.status = normalizeStatus(status);
        if (tags !== undefined) task.tags = JSON.stringify(parseTags(tags));
        if (dueDate !== undefined) task.dueDate = dueDate || null;

        await task.save();

        const updated = await Task.findByPk(id, { include: includeConfig });

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: formatTask(updated)
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating task',
            error: error.message
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterId = req.user?.userId;
        const requesterRole = String(req.user?.role || '').toLowerCase();

        const task = await Task.findByPk(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        if (requesterRole === 'student' && Number(task.createdBy) !== Number(requesterId)) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete tasks created by you'
            });
        }

        await task.destroy();

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting task',
            error: error.message
        });
    }
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};
