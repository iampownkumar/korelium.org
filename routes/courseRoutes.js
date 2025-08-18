const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticateToken = require('../middleware/authMiddleware');

// Public: Get all courses (remove `authenticateToken` if you want this open)
router.get('/', authenticateToken, courseController.getAllCourses);

// Admin-only: Create, Update, Delete course
router.post('/', authenticateToken, courseController.createCourse);
// router.put('/:id', authenticateToken, courseController.updateCourse);
// router.delete('/:id', authenticateToken, courseController.deleteCourse);

module.exports = router;
