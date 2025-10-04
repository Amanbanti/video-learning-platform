import mongoose from "mongoose";

const categoryEnum = [
  "Natural-FreshMan",
  "Natural-Remedial",
  "Social-FreshMan",
  "Social-Remedial",
  "Common",
];

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true, enum: categoryEnum }, 
  videoUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Course", courseSchema);
