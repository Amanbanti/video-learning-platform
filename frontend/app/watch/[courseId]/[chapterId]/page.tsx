"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { ThemeToggle } from "../../../../components/theme-toggle"
import { BookOpen, LogOut, ArrowLeft, Maximize } from "lucide-react"
import { getCurrentUser, logout } from "../../../../lib/auth"
import { mockCourses, type Course, type Chapter } from "../../../../lib/course"

export default function WatchPage() {
  const [user, setUser] = useState(getCurrentUser())
  const [course, setCourse] = useState<Course | null>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId as string
  const chapterId = params.chapterId as string

  const playerContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    const foundCourse = mockCourses.find((c) => c._id === courseId)
    const foundChapter = foundCourse?.chapters.find((c) => c._id === chapterId)

    setCourse(foundCourse || null)
    setChapter(foundChapter || null)
  }, [user, courseId, chapterId, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const videoId = useMemo(() => {
    if (!chapter?.videoUrl) return null
    const m = chapter.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/)
    return m ? m[1] : null
  }, [chapter?.videoUrl])

  const embedSrc = useMemo(() => {
    if (!videoId) return null
    const origin = typeof window !== "undefined" ? encodeURIComponent(window.location.origin) : undefined
    const params = [
      "controls=0",
      "modestbranding=1",
      "rel=0",
      "iv_load_policy=3",
      "disablekb=1",
      "playsinline=1",
      "fs=1",
      origin ? `origin=${origin}` : undefined,
    ]
      .filter(Boolean)
      .join("&")
    return `https://www.youtube.com/embed/${videoId}?${params}`
  }, [videoId])

  if (!user || !course || !chapter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Content not found</h3>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/course/${courseId}`)}>
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
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Video Player (60% of phone height) */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <div ref={playerContainerRef} className="relative w-full h-[60vh] bg-black rounded-md">
                {embedSrc ? (
                  <iframe
                    src={embedSrc}
                    title="Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    Invalid YouTube URL
                  </div>
                )}

                {/* Fullscreen button */}
                <div className="absolute bottom-3 right-3">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => playerContainerRef.current?.requestFullscreen()}
                    className="bg-white/10 hover:bg-white/20 text-white"
                    title="Fullscreen"
                  >
                    <Maximize className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Chapter Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{chapter.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Course: {course.title}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Chapter List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Chapters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {course.chapters.map((ch, index) => (
                  <div
                    key={ch._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      ch._id === chapterId ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                    onClick={() => router.push(`/watch/${courseId}/${ch._id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          ch._id === chapterId ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{ch.title}</div>
                        <div className={`text-xs ${ch._id === chapterId ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {/* {ch.duration} */}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
