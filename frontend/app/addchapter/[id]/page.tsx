"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion"
import { BookOpen, Play, Clock, Lock } from "lucide-react"
import { getCurrentUser, logout } from "../../../lib/auth"
import { mockCourses, type Course, type Chapter } from "../../../lib/course"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import Header from "../../../components/Header"

import { LoaderCircle } from "lucide-react"

import { toast } from "react-hot-toast"
import { fetchCourseById} from "../../../lib/course"

export default function CoursePage() {
  const [user, setUser] = useState(getCurrentUser())
  const [course, setCourse] = useState<Course | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [duration, setDuration] = useState("")
  const [loading, setLoading] = useState(false)

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
    const chapter = course?.chapters.find((c) => c.id === chapterId)
    if (!chapter) return
    router.push(`/watch/${courseId}/${chapterId}`)
  }

  // const canAccessChapter = (chapter: Chapter) => {
  //   if (user.subscriptionStatus === "active") return true
  //   if (user.subscriptionStatus === "trial" && user.trialVideosWatched < user.maxTrialVideos) return true
  //   return false
  // }

  const handleAddChapter = async () => {
    if (!title.trim()) return
    setLoading(true)

    try {
      // Example API call
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      })

      if (!res.ok) throw new Error("Failed to add chapter")

      setTitle("")
      setDescription("")
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }



  

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
          <div className="flex items-center gap-4 mb-4">
            <Badge>{course.category}</Badge>
          </div>

          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <p className="text-muted-foreground text-lg mb-6">{course.description}</p>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span>{course.chapters.length} chapters</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Chapters</CardTitle>
                <CardDescription>
                  Click on any chapter to start watching. Premium chapters require a subscription.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {course.chapters.map((chapter, index) => (
                    <AccordionItem key={chapter.id} value={chapter.id}>
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
                                {true && (
                                  <>
                                    <Lock className="h-3 w-3" />
                                    <span>Premium</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-4 pl-11">
                          <Button
                            onClick={() => handleChapterSelect(chapter.id)}
                           
                            className="w-full sm:w-auto"
                          >
                            {true ? (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Watch Chapter
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Upgrade to Watch
                              </>
                            )}
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
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
                <Dialog>
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
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                            
                            />

                       </div>


                       <div className="pb-3">
                            <div className="pb-2 text-sm text-muted-foreground" >Chapter Description</div>
                            <Textarea
                            placeholder="Chapter description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                       </div>


                       <div className="pb-3">
                            <div className="pb-2 text-sm text-muted-foreground" >Chapter Video URL</div>
                            <Input
                            placeholder="Chapter Video URL"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                          />
                       </div>


                       <div className="pb-3">
                            <div className="pb-2 text-sm text-muted-foreground" >Chapter Duration</div>
                            
                            <Input
                              placeholder="Chapter duration in minites"
                              value={duration}
                              onChange={(e) => setDuration(e.target.value)}
                            />
                       </div>
                      
                      

                      <Button className="w-full cursor-pointer" onClick={handleAddChapter} disabled={loading}>
                        {loading ? "Adding..." : "Add Chapter"}
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Chapters</span>
                  <span className="font-medium">{course.chapters.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Free Chapters</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Premium Chapters</span>
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
