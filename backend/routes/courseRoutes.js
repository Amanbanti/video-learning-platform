import express from "express";
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import upload from "../middleware/upload.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",authMiddleware,adminMiddleware, getCourses);
router.get("/:id",authMiddleware, getCourse);
router.post("/",authMiddleware,adminMiddleware, upload.single("coverImage"), createCourse); 
router.put("/:id",authMiddleware,adminMiddleware, upload.single("coverImage"), updateCourse);
router.delete("/:id",authMiddleware,adminMiddleware, deleteCourse);

export default router;
