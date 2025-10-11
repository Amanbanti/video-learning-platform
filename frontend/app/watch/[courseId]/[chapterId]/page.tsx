"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { ThemeToggle } from "../../../../components/theme-toggle"
import { BookOpen, LogOut, ArrowLeft, Play, Pause, Volume2, Maximize, SkipBack, SkipForward } from "lucide-react"
import { getCurrentUser, logout, setCurrentUser } from "../../../../lib/auth"
import {mockCourses, type Course, type Chapter, } from "../../../../lib/course"

export default function WatchPage() {
  const [user, setUser] = useState(getCurrentUser())
  const [course, setCourse] = useState<Course | null>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId as string
  const chapterId = params.chapterId as string

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    const foundCourse = mockCourses.find((c) => c._id === courseId)
    const foundChapter = foundCourse?.chapters.find((c) => c._id === chapterId)

    setCourse(foundCourse || null)
    setChapter(foundChapter || null)

    // // Update trial videos watched if this is a premium chapter and user is on trial
    // if (foundChapter?.isPremium && user.subscriptionStatus === "trial") {
    //   const updatedUser = {
    //     ...user,
    //     trialVideosWatched: Math.min(user.trialVideosWatched + 1, user.maxTrialVideos),
    //   }
    //   setCurrentUser(updatedUser)
    //   setUser(updatedUser)
    // }
  }, [user, courseId, chapterId, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const goToNextChapter = () => {
    if (!course) return
    const currentIndex = course.chapters.findIndex((c) => c._id === chapterId)
    const nextChapter = course.chapters[currentIndex + 1]
    if (nextChapter) {
      router.push(`/watch/${courseId}/${nextChapter._id}`)
    }
  }

  const goToPreviousChapter = () => {
    if (!course) return
    const currentIndex = course.chapters.findIndex((c) => c._id === chapterId)
    const prevChapter = course.chapters[currentIndex - 1]
    if (prevChapter) {
      router.push(`/watch/${courseId}/${prevChapter._id}`)
    }
  }

  if (!user || !course || !chapter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Content not found</h3>
          <p className="text-muted-foreground mb-4">The video you're looking for doesn't exist.</p>
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
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <div className="relative bg-black aspect-video">
                <video
                  ref={videoRef}
                  src={chapter.videoUrl}
                  className="w-full h-full"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div
                      className="w-full bg-white/20 rounded-full h-1 cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const percent = (e.clientX - rect.left) / rect.width
                        handleSeek(percent * duration)
                      }}
                    >
                      <div
                        className="bg-primary h-1 rounded-full transition-all"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPreviousChapter}
                        className="text-white hover:bg-white/20"
                      >
                        <SkipBack className="h-5 w-5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePlayPause}
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNextChapter}
                        className="text-white hover:bg-white/20"
                      >
                        <SkipForward className="h-5 w-5" />
                      </Button>

                      <div className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                        <Volume2 className="h-5 w-5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => videoRef.current?.requestFullscreen()}
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Chapter Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{chapter.title}</CardTitle>
                {/* <CardDescription>{chapter.description}</CardDescription> */}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {/* <span>Duration: {chapter.}</span> */}
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
                        <div
                          className={`text-xs ${
                            ch._id === chapterId ? "text-primary-foreground/80" : "text-muted-foreground"
                          }`}
                        >
                          33
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
