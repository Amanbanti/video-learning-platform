"use client";

import { useState } from "react";
import { Plus,Edit } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";

import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import {updateCourse} from "../lib/course";
import toast from "react-hot-toast";


// Category enum as a readonly tuple
export const categoryEnum = [
    "Natural-FreshMan",
    "Natural-Remedial",
    "Social-FreshMan",
    "Social-Remedial",
    "Common",
  ] as const;
  
  export type CategoryEnum = typeof categoryEnum[number];
  
  // Chapter interface
  export interface Chapter {
    _id: string;
    title: string;
    videoUrl: string;
    duration: string;
    description: string;
  }
  // Course interface
  export interface Course {
    _id: string;
    title: string;
    description: string;
    instructor: string;
    coverImageUrl: string;
    category: CategoryEnum;
    chapters: Chapter[];
  }

  export default function EditCourse({ course, onCourseUpdated }: { course: Course; onCourseUpdated: () => void }) {
    const courseId = course._id;
    const [title, setTitle] = useState(course.title ?? "");
    const [description, setDescription] = useState(course.description ?? "");
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [instructor, setInstructor] = useState(course.instructor ?? "");
    const [category, setCategory] = useState(course.category ?? "");

    const [isLoading, setIsLoading] = useState(false);

    const [open, setOpen] = useState(false); // dialog state
    



  type CategoryEnum = typeof categoryEnum[number];

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
  

    if(coverImage) {
        if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(coverImage.type)) {
            toast.error("Invalid image type. Allowed types: jpg, jpeg, png, webp.");
            return;
          }
    }
  
    
  
    try {
      const result = await updateCourse(
        courseId,
        title,
        description,
        instructor,
        category as CategoryEnum,
        coverImage
      );
      toast.success("Course Updated successfully!");
      setIsLoading(false);
        onCourseUpdated();
   
      // Reset form or close dialog here
      setOpen(false);
      setIsLoading(false);


    } catch (err:any) {
      toast.error(err?.response?.data?.message || "Error updating course!");
      console.error("Error updating course:", err);
    }finally {
        setIsLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="flex-1 bg-transparent cursor-pointer">
            <Edit className="h-3 w-3 mr-1" />
            Edit
            </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update the form to edit the course.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="pb-4" htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Course Title"
            />
          </div>

          <div>
            <Label  className="pb-4" htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Course Description"
            />
          </div>

          <div>
            <Label  className="pb-4" htmlFor="coverImage">Cover Image</Label>
            <Input
              id="coverImage"
              type="file"
              accept={allowedTypes.join(",")}
              onChange={(e) => setCoverImage(e.target.files ? e.target.files[0] : null)}
            />
          </div>

          <div>
            <Label  className="pb-4" htmlFor="instructor">Instructor</Label>
            <Input
              id="instructor"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              required
              placeholder="Instructor Name"
            />
          </div>

          <div>
            <Label  className="pb-4" htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as CategoryEnum)} required>
              <SelectTrigger id="category" className="w-full cursor-pointer">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryEnum.map((cat) => (
                  <SelectItem key={cat} value={cat}  className="cursor-pointer">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <DialogClose className="cursor-pointer" asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="cursor-pointer" disabled={isLoading}>{isLoading ? "Updating" : "Update"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
