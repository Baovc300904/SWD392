const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const classRoutes = require('./class.routes');
const topicRoutes = require('./topic.routes');
const groupRoutes = require('./group.routes');
const questionRoutes = require('./question.routes');
const answerRoutes = require('./answer.routes');

// Authentication routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Academic Core routes (Q&A System)
router.use('/classes', classRoutes);
router.use('/topics', topicRoutes);
router.use('/groups', groupRoutes);

// Q&A routes
router.use('/questions', questionRoutes);
router.use('/', answerRoutes); // Includes /questions/:id/answers and /answers/:id

module.exports = router;
