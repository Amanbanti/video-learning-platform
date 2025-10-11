import Course from "../models/courseModel.js";
import mongoose from "mongoose";


// @desc    Get all courses with category filter + pagination
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
    try {
      const { category, page = 1, limit = 10 } = req.query;
  
      // Build filter object
      const filter = {};
      if (category) {
        filter.category = category;
      }
  
      // Convert to numbers (query params are strings)
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
  
      // Query DB
      const courses = await Course.find(filter)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 }); // newest first
  
      // Count total for pagination metadata
      const total = await Course.countDocuments(filter);
  
      res.status(200).json({
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        courses,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Server error" });
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

      const uniqeTitle = await Course.findOne({title})
      if(uniqeTitle) return res.status(400).json({message:"Course with this title already exists!"})
  
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


  export const createChapter = async (req,res)=>{

    const { courseId } = req.params;
    const { title, description, videoUrl, duration } = req.body;
  
    if (!title || !description || !videoUrl || !duration) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });
  
      // Add the new chapter
      const newChapter = { id: Date.now().toString(), title, description, videoUrl, duration };
      course.chapters.push(newChapter);
  
      await course.save();
      res.status(201).json(newChapter);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }

  }


// @desc    Update a course by ID
// @route   PUT /api/courses/:id
// @access  Public (or protected if you have auth)
export const updateCourse = async (req, res) => {
  try {
    const { title, description, instructor, category} = req.body;

    if (!title || !description || !instructor || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if(req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const updatedData = {
      title,
      description,
      instructor,
      category,
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
