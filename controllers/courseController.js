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
    let imagePath = null;
    if (req.file) {
      imagePath = req.file.path.replace(/\\/g, '/');
    }

    // Parse tags and whatYoullLearn fields properly
    let tagsValue = req.body.tags;
    if (tagsValue && typeof tagsValue === 'string') {
      try { tagsValue = JSON.parse(tagsValue); } catch (e) { tagsValue = []; }
    }
    if (Array.isArray(tagsValue)) {
      tagsValue = JSON.stringify(tagsValue);
    }

    let whatYoullLearnValue = req.body.whatYoullLearn;
    if (whatYoullLearnValue && typeof whatYoullLearnValue === 'string') {
      try { whatYoullLearnValue = JSON.parse(whatYoullLearnValue); } catch (e) { whatYoullLearnValue = []; }
    }
    if (Array.isArray(whatYoullLearnValue)) {
      whatYoullLearnValue = JSON.stringify(whatYoullLearnValue);
    }

    const courseData = {
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      image: imagePath,
      category: req.body.category,
      tags: tagsValue,
      instructor: req.body.instructor,
      duration: req.body.duration,
      students: req.body.students,
      rating: req.body.rating,
      udemyLink: req.body.udemyLink,
      fullDescription: req.body.fullDescription,
      prerequisites: req.body.prerequisites,
      level: req.body.level,
      language: req.body.language,
      lastUpdated: req.body.lastUpdated,
      certificate: req.body.certificate,
      whatYoullLearn: whatYoullLearnValue,
    };

    const course = await Course.create(courseData);

    // Parse back to array/object for tags and whatYoullLearn in the response
    const parsedCourse = {
      ...course.toJSON(),
      tags: course.tags ? JSON.parse(course.tags) : [],
      whatYoullLearn: course.whatYoullLearn ? JSON.parse(course.whatYoullLearn) : [],
    };

    res.status(201).json({ message: 'Course created successfully', course: parsedCourse });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


module.exports = {
  getAllCourses,
  createCourse
};
