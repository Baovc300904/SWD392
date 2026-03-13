/**
 * Submission Routes
 * API endpoints for assignment submissions
 */

const express = require('express');
const router = express.Router();
const {
    getAllSubmissions,
    getSubmissionById,
    createSubmission,
    updateSubmission,
    deleteSubmission,
    gradeSubmission
} = require('../controllers/submission.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', authenticate, getAllSubmissions);
router.get('/:id', authenticate, getSubmissionById);
router.post('/', authenticate, createSubmission);
router.put('/:id', authenticate, updateSubmission);
router.delete('/:id', authenticate, deleteSubmission);
router.put('/:id/grade', authenticate, authorize('lecturer', 'manager'), gradeSubmission);

module.exports = router;
