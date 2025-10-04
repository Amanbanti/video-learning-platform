"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog";

import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";

export default function AddCourseDialog() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [coverImage, setCoverImage] = useState(null);
    const [instructor, setInstructor] = useState("");
    const [category, setCategory] = useState("");
    
  const categories = [
    "Natural-FreshMan",
    "Natural-Remedial",
    "Social-FreshMan",
    "Social-Remedial",
    "Common",
  ];

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ title, description, coverImage, instructor, category });
    // Here you can handle the file upload and form submission
  };

  return (
    <Dialog>
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
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Course Title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Course Description"
            />
          </div>

          <div>
            <Label htmlFor="coverImage">Cover Image</Label>
            <Input
              id="coverImage"
              type="file"
              accept={allowedTypes.join(",")}
              onChange={(e) => setCoverImage(e.target.files ? e.target.files[0] : null)}
            />
          </div>

          <div>
            <Label htmlFor="instructor">Instructor</Label>
            <Input
              id="instructor"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              required
              placeholder="Instructor Name"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
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
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
