const { Course } = require('../models');
const express = require('express');
const router = express.Router();

// Get all courses (public)
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.findAll();
    const parsedCourses = courses.map(course => ({
      ...course.toJSON(),
      tags: course.tags ? JSON.parse(course.tags) : [],
      whatYoullLearn: course.whatYoullLearn ? JSON.parse(course.whatYoullLearn) : [],
    }));
    res.json(parsedCourses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
