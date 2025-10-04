import Course from "../models/course.js";

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Public (or protected if you have auth)
export const createCourse = async (req, res) => {
    try {
      const { title, description, instructor, category, chapters } = req.body;
  
      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ message: "Cover image is required" });
      }
  
      const coverImageUrl = req.file.path; // saved file path
  
      const newCourse = new Course({
        title,
        description,
        instructor,
        category,
        chapters: chapters ? JSON.parse(chapters) : [], // parse if sent as string
        coverImageUrl,
      });
  
      const savedCourse = await newCourse.save();
      res.status(201).json(savedCourse);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


// @desc    Update a course by ID
// @route   PUT /api/courses/:id
// @access  Public (or protected if you have auth)
export const updateCourse = async (req, res) => {
  try {
    const { title, description, instructor, category, chapters } = req.body;
    const updatedData = {
      title,
      description,
      instructor,
      category,
      chapters: chapters ? JSON.parse(chapters) : [], // parse if sent as string
    };

    // If a new cover image is uploaded
    if (req.file) {
      updatedData.coverImageUrl = req.file.path;
    }
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!updatedCourse) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course by ID
// @route   DELETE /api/courses/:id
// @access  Public (or protected if you have auth)
export const deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) return res.status(404).json({ message: "Course not found" });

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
