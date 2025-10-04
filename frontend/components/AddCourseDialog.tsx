"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import {createCourse} from "../lib/course";
import toast from "react-hot-toast";

export default function AddCourseDialog() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [instructor, setInstructor] = useState("");
    const [category, setCategory] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const [open, setOpen] = useState(false); // dialog state
    


  const categoryEnum = [
    "Natural-FreshMan",
    "Natural-Remedial",
    "Social-FreshMan",
    "Social-Remedial",
    "Common",
  ] as const;
  
  type CategoryEnum = typeof categoryEnum[number];

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
  
    if (!coverImage) {
      toast.error("Cover image is required.");
      return;
    }
  
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(coverImage.type)) {
      toast.error("Invalid image type. Allowed types: jpg, jpeg, png, webp.");
      return;
    }
  
    try {
      const result = await createCourse(
        title,
        description,
        instructor,
        category as CategoryEnum,
        coverImage
      );
      console.log("Course created:", result);
      toast.success("Course created successfully!");
      setIsLoading(false);
      setTitle("");
      setDescription("");
      setCoverImage(null);
      setInstructor("");
      setCategory("");
      // Reset form or close dialog here
      setOpen(false);
      setIsLoading(false);


    } catch (err:any) {
      toast.error(err?.response?.data?.message || "Error creating course!");
      console.error("Error creating course:", err);
    }finally {
        setIsLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Add New Course
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>
            Fill out the form to create a new course.
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
            <Select value={category} onValueChange={setCategory} required>
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
            <Button type="submit" className="cursor-pointer" disabled={isLoading}>{isLoading ? "Creating" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
