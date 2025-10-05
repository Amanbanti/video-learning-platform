import mongoose from "mongoose";

const categoryEnum = [
  "Natural-FreshMan",
  "Natural-Remedial",
  "Social-FreshMan",
  "Social-Remedial",
  "Common",
];

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  instructor: { type: String, required: true },
  coverImageUrl: { type: String,required: true },
  category: { type: String, required: true, enum: categoryEnum }, 
  chapters: [chapterSchema], // array of chapters
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Course", courseSchema);
