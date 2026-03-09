/**
 * Class Routes
 * Routes for class CRUD operations
 */

const express = require('express');
const router = express.Router();
const {
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass
} = require('../controllers/class.controller');

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Get all classes
 *     tags: [Classes]
 *   post:
 *     summary: Create new class
 *     tags: [Classes]
 */
router.route('/').get(getAllClasses).post(createClass);

/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Get class by ID
 *     tags: [Classes]
 *   put:
 *     summary: Update class
 *     tags: [Classes]
 *   delete:
 *     summary: Delete class
 *     tags: [Classes]
 */
router.route('/:id').get(getClassById).put(updateClass).delete(deleteClass);

module.exports = router;
