"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { BookOpen, LogOut, Play, Clock, ArrowLeft } from "lucide-react"
import { getCurrentUser, logout, mockCourses } from "@/lib/auth"

export default function CoursesPage() {
  const [user, setUser] = useState(getCurrentUser())
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get("category") as "natural" | "social" | null

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleCourseSelect = (courseId: string) => {
    router.push(`/course/${courseId}`)
  }

  if (!user) return null

  const filteredCourses = category ? mockCourses.filter((course) => course.category === category) : mockCourses

  const categoryTitle =
    category === "natural" ? "Natural Sciences" : category === "social" ? "Social Sciences" : "All Courses"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{categoryTitle}</h1>
          <p className="text-muted-foreground">
            {category === "natural" && "Explore mathematics, physics, chemistry, and other natural sciences"}
            {category === "social" && "Discover history, psychology, sociology, and other social sciences"}
            {!category && "Browse all available courses across natural and social sciences"}
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
              onClick={() => handleCourseSelect(course.id)}
            >
              <CardHeader className="pb-4">
                <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={course.category === "natural" ? "default" : "secondary"}>
                    {course.category === "natural" ? "Natural" : "Social"}
                  </Badge>
                  {course.isPremium && <Badge variant="outline">Premium</Badge>}
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      <span>{course.chapters.length} chapters</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {course.chapters.reduce((total, chapter) => {
                          const [minutes] = chapter.duration.split(":").map(Number)
                          return total + minutes
                        }, 0)}
                        m
                      </span>
                    </div>
                  </div>
                </div>
                <Button className="w-full group-hover:bg-primary/90">
                  <Play className="h-4 w-4 mr-2" />
                  Start Course
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground">There are no courses available in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
