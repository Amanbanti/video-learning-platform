"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion"
import { BookOpen, Play, Clock, LoaderCircle } from "lucide-react"
import Header from "../../../components/Header"
import { toast } from "react-hot-toast"
import { getCurrentUser, updateTrialVideosWatched } from "../../../lib/auth"
import { fetchCourseById, type Course } from "../../../lib/course"
import { YouTubePlayer } from "../../../components/YouTubeVideoPlayer"

export default function CoursePage() {
  const [user, setUser] = useState<any>(getCurrentUser())
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeChapter, setActiveChapter] = useState<string | null>(null)
  const [localUser, setLocalUser] = useState<any>(user)

  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  // 🔹 Fetch course
  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    const fetchCourse = async () => {
      try {
        setLoading(true)
        const data = await fetchCourseById(courseId)
        setCourse(data)
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || err.message || "Failed to fetch course details"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [user, courseId, router])

  const handleChapterSelect = async (chapterId: string) => {
    const userDataString = localStorage.getItem("currentUser")
    if (!userDataString) return

    const currentUser = JSON.parse(userDataString).user

    try {
      const updatedUser = await updateTrialVideosWatched(currentUser._id)
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ ...JSON.parse(userDataString), user: updatedUser })
      )
      setLocalUser(updatedUser)

      if (updatedUser.subscriptionStatus === "Trial" || updatedUser.subscriptionStatus === "Pending") {
        toast.success(
          `You have watched ${updatedUser.trialVideosWatched} of ${updatedUser.maxTrialVideos} trial videos.`
        )

        if (updatedUser.trialVideosWatched >= 4) {
          toast.error("Trial limit reached. Upgrade to Premium to continue watching.")
          router.push("/subscription")
          return
        }
      }

      setActiveChapter(prev => (prev === chapterId ? null : chapterId))
      // Navigate to the watch page
      router.push(`/watch/${courseId}/${chapterId}`)
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error(err.response.data.message || "Trial limit reached.")
        router.push("/subscription")
      } else {
        toast.error("Failed to update trial videos.")
        console.error(err)
      }
    }
  }

  // 🔹 Loading state
  if (loading) {
    return (
      <div>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // 🔹 No course found
  if (!course) {
    return (
      <div>
        <Header />
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

  // 🔹 Main page
  return (
    <div className="min-h-screen bg-background">
      <Header />

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
            <span>{course.instructor}</span>
          </div>
          <p className="text-muted-foreground text-lg mb-6">{course.description}</p>

          {/* ✅ Trial Status Banner */}
          {localUser && localUser.subscriptionStatus !== "Active" && (
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium mb-2">
                    {user.subscriptionStatus === "Trial"
                      ? `You're on Trial Mode — ${localUser.maxTrialVideos-localUser.trialVideosWatched} video${localUser.maxTrialVideos-localUser.trialVideosWatched === 1 ? "" : "s"} left.`
                      : "Your subscription is pending. You can only watch limited videos until it's approved."}
                  </p>

                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-yellow-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(localUser.trialVideosWatched/localUser.maxTrialVideos)*100}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs mt-1">
                    <span>
                      Progress: {localUser.trialVideosWatched}/{localUser.maxTrialVideos} videos
                    </span>
                    <span>{Math.round(localUser.trialVideosWatched/localUser.maxTrialVideos)*100}%</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="destructive"
                  className="whitespace-nowrap cursor-pointer"
                  onClick={() => router.push("/subscription")}
                >
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chapters List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Chapters</CardTitle>
                <CardDescription>Click on any chapter to start watching.</CardDescription>
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
                                  <span>{chapter.duration} mins</span>
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

                            <Button
                              onClick={() => handleChapterSelect(chapter._id)}
                              className="w-full sm:w-auto cursor-pointer"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Watch Chapter
                            </Button>
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
                        ? course.chapters.reduce((acc, c) => acc + Number(c.duration), 0) + " mins"
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
