const { Course } = require('../models');

// Get all courses
const getAllCourses = async (req, res) => {
  try {
   const courses = await Course.findAll();

    const parsedCourses = courses.map(course => {
    return {
        ...course.dataValues,
        tags: JSON.parse(course.tags || '[]'),
        whatYoullLearn: course.whatYoullLearn ? JSON.parse(course.whatYoullLearn) : null, // here we are 
  };
});

res.json(parsedCourses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// create a new courses 
// const createCourse = async (req, res) => {
//   try {
//     // If tags or whatYoullLearn comes as arrays, convert to JSON string
//     const courseData = {
//       ...req.body,
//     };
//     if (Array.isArray(req.body.tags)) {
//       courseData.tags = JSON.stringify(req.body.tags);
//     }
//     if (Array.isArray(req.body.whatYoullLearn)) {
//       courseData.whatYoullLearn = JSON.stringify(req.body.whatYoullLearn);
//     }

//     const course = await Course.create(courseData);
//     res.status(201).json({ message: 'Course created successfully', course });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };
const createCourse = async (req, res) => {
  try {
    // Get the image file path (if file is uploaded)
    let imagePath = null;
    if (req.file) {
      imagePath = req.file.path.replace(/\\/g, '/'); // For Windows support
    }

    // Prepare data
    const courseData = {
      ...req.body,
      image: imagePath,
    };
    if (Array.isArray(req.body.tags)) {
      courseData.tags = JSON.stringify(req.body.tags);
    }
    if (Array.isArray(req.body.whatYoullLearn)) {
      courseData.whatYoullLearn = JSON.stringify(req.body.whatYoullLearn);
    }

    const course = await Course.create(courseData);
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


module.exports = {
  getAllCourses,
  createCourse
};
