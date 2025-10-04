"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../..//components/ui/accordion"
import { ThemeToggle } from "../../../components/theme-toggle"
import { BookOpen, LogOut, Play, Clock, ArrowLeft, Lock } from "lucide-react"
import { getCurrentUser, logout } from "../../../lib/auth"
import { mockCourses, type Course, type Chapter } from "../../../lib/course"

export default function CoursePage() {
  const [user, setUser] = useState(getCurrentUser())
  const [course, setCourse] = useState<Course | null>(null)
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    const foundCourse = mockCourses.find((c) => c.id === courseId)
    setCourse(foundCourse || null)
  }, [user, courseId, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleChapterSelect = (chapterId: string) => {
    const chapter = course?.chapters.find((c) => c.id === chapterId)
    if (!chapter) return

    // Check if user can access this chapter
    // if (chapter.isPremium && user?.subscriptionStatus === "trial") {
    //   if (user.trialVideosWatched >= user.maxTrialVideos) {
    //     router.push("/subscription")
    //     return
    //   }
    // }

    router.push(`/watch/${courseId}/${chapterId}`)
  }

  if (!user || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Course not found</h3>
          <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  const canAccessChapter = (chapter: Chapter) => {
    // if (!chapter.isPremium) return true
    if (user.subscriptionStatus === "active") return true
    if (user.subscriptionStatus === "trial" && user.trialVideosWatched < user.maxTrialVideos) return true
    return false
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">EduLearn</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Badge >
              {course.category}
            </Badge>
           
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
              {/* <span>
                {course.chapters.reduce((total, chapter) => {
                  const [minutes] = chapter.duration.split(":").map(Number)
                  return total + minutes
                }, 0)}{" "}
                minutes total
              </span> */}
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
                                {/* {chapter.duration} */22}
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
                          {/* <p className="text-muted-foreground mb-4">{chapter.description}</p> */}
                          <Button
                            onClick={() => handleChapterSelect(chapter.id)}
                            disabled={!canAccessChapter(chapter)}
                            className="w-full sm:w-auto"
                          >
                            {canAccessChapter(chapter) ? (
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
            {/* Trial Status */}
            {user.subscriptionStatus === "trial" && (
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
                <CardHeader>
                  <CardTitle className="text-lg">Free Trial</CardTitle>
                  <CardDescription>{user.maxTrialVideos - user.trialVideosWatched} videos remaining</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => router.push("/subscription")}>
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            )}

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
                  {/* <span className="font-medium">{course.chapters.filter((c) => !c.isPremium).length}</span> */}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Premium Chapters</span>
                  {/* <span className="font-medium">{course.chapters.filter((c) => c.isPremium).length}</span> */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
