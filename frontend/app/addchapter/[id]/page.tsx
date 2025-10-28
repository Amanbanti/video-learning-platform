"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion"
import { BookOpen, Play, Clock, Lock } from "lucide-react"
import { getCurrentUser, logout } from "../../../lib/auth"
import {  type Course, type Chapter } from "../../../lib/course"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import Header from "../../../components/Header"

import ReactPlayer from "react-player";

import { LoaderCircle } from "lucide-react"

import { toast } from "react-hot-toast"
import { fetchCourseById, createChapter} from "../../../lib/course"
import YouTubePlayer from "../../../components/YouTubeVideoPlayer"


export default function CoursePage() {
  const [user, setUser] = useState(getCurrentUser())
  const [course, setCourse] = useState<Course | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [duration, setDuration] = useState("")
  const [loading, setLoading] = useState(false)

  const [chapterLoading, setChapterLoading] = useState(false)

  const [activeChapter, setActiveChapter] = useState<string | null>(null)


  const [open,setOpen] =useState(false)

  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string



  useEffect(() => {

    if (!user) {
      router.push("/auth")
      return
    }
    if (user.isAdmin !== true) {
      router.push("/dashboard")
      return
    }
    
  
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const data = await fetchCourseById(courseId) // await here
        setCourse(data)
      } catch (err: any) {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch course details"
        )
        console.error("Error fetching course:", err)
      }finally{
        setLoading(false)
      }
    }
  
    fetchCourse()
  }, [user, courseId, router])



  if (loading) {
    return (
      <div>
        <Header/>
        <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>

      </div>
      
    )
  }



  if (!course) {
    return (
      <div>
          <Header/>
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Course not found</h3>
              <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist.</p>
              <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
            </div>
          </div>

      </div>
      
    )
  }
  


  const handleChapterSelect = (chapterId: string) => {
    setActiveChapter((prev) => (prev === chapterId ? null : chapterId))
  }
  



const handleAddChapter = async () => {
  if (!title || !description || !videoUrl || !duration) {
    toast.error("All fields required!");
    return;
  }

  try {
    setChapterLoading(true);
    const newChapter = await createChapter(courseId, { title, description, videoUrl, duration });
    toast.success("Chapter added successfully!");
    setCourse((prev) => prev ? { ...prev, chapters: [...prev.chapters, newChapter] } : prev);
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setDuration("");

  setOpen(false);
  } catch (error) {
    toast.error("Failed to add chapter.");
  } finally {
    setChapterLoading(false);
  }
};

  

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header/>


      {loading ?(
            <div className="flex items-center justify-center min-h-screen">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
          </div>
      ):(
        <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-muted-foreground">Category:</span>
            <Badge>{course.category}</Badge>
          </div>
          <div className="flex items-center gap-2 pb-4 text-sm text-muted-foreground">
              <span>Instructor:</span>
              <span >{course.instructor}</span>

          </div>
          <p className="text-muted-foreground text-lg mb-6">{course.description}</p>

        </div>

        {/* Course Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Chapters</CardTitle>
                <CardDescription>
                  Click on any chapter to start watching.
                </CardDescription>
              </CardHeader>
              <CardContent>
              <Accordion type="single" collapsible className="w-full">
                    {course.chapters.length > 0 ? (
                      course.chapters.map((chapter: any, index: number) => (
                        <AccordionItem key={chapter._id} value={chapter._id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full mr-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <div className="text-left">
                                  <div className="font-medium">{chapter.title}</div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    <span className="text-sm text-muted-foreground pt-2">
                                      {chapter.duration} mins
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pt-2 pl-11">
                              <div className="text-sm text-muted-foreground pb-3">
                                Description: {chapter.description}
                              </div>

                              {activeChapter === chapter._id ? (
                                      <div className="aspect-video w-full rounded-lg overflow-hidden">
                                        <YouTubePlayer videoUrl={chapter.videoUrl} />
                                      </div>
                                    ) : (
                                      <Button
                                        onClick={() => handleChapterSelect(chapter._id)}
                                        className="w-full sm:w-auto"
                                      >
                                        <Play className="h-4 w-4 mr-2 cursor-pointer" />
                                        Watch Chapter
                                      </Button>
                                    )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground col-span-3">
                        No chapters found.
                      </div>
                    )}
                  </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Add Chapter (replaces Free Trial card) */}
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="text-lg">Add Chapter</CardTitle>
                <CardDescription>Create a new chapter for this course</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full cursor-pointer">+ Add Chapter</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Chapter</DialogTitle>
                      <DialogDescription>
                        Fill in the details below to add a new chapter to your course.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddChapter} className="space-y-4 mt-2">

                       <div className="pb-3">
                        <div className="pb-2 text-sm text-muted-foreground" >Chapter Title</div>
                        <Input
                              placeholder="Chapter title"
                              required
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                            
                            />

                       </div>


                       <div className="pb-3">
                            <div className="pb-2 text-sm text-muted-foreground" >Chapter Description</div>
                            <Textarea
                            placeholder="Chapter description"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                       </div>


                       <div className="pb-3">
                            <div className="pb-2 text-sm text-muted-foreground" >Chapter Video URL</div>
                            <Input
                            placeholder="Chapter Video URL"
                            required
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                          />
                       </div>


                       <div className="pb-3">
                            <div className="pb-2 text-sm text-muted-foreground" >Chapter Duration in minuets</div>
                            
                            <Input
                              placeholder="Chapter duration in minites"
                              value={duration}
                              required
                              onChange={(e) => setDuration(e.target.value)}
                            />
                       </div>
                      
                      

                      <Button className="w-full cursor-pointer" onClick={handleAddChapter} disabled={chapterLoading}>
                        {chapterLoading ? "Adding..." : "Add Chapter"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 pb-4">
                      <Play className="h-4 w-4" />
                      <span>{course.chapters.length} chapters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Total Duration:{" "}
                        {course.chapters.length > 0
                          ? course.chapters.reduce((acc, chapter) => acc + Number(chapter.duration), 0) + " mins"
                          : "N/A"}
                      </span>
                    </div>
              
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      )}
  
      
    </div>
  )
}
