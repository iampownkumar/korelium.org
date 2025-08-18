const { Course } = require('../models');

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      limit: 5 // Limit to 5 courses
    });

    const parsedCourses = courses.map(course => ({
      ...course.toJSON(),
      tags: course.tags ? JSON.parse(course.tags) : [],
      whatYoullLearn: course.whatYoullLearn ? JSON.parse(course.whatYoullLearn) : [],
    }));

    res.json(parsedCourses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAllCourses,
};
