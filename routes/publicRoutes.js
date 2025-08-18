const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Public route to get all courses
router.get('/courses', publicController.getAllCourses);

module.exports = router;
