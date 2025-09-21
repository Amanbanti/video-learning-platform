"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"
import { BookOpen, LogOut, Play, Clock, Star } from "lucide-react"
import { getCurrentUser, logout, mockCourses } from "@/lib/auth"

export default function DashboardPage() {
  const [user, setUser] = useState(getCurrentUser())
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    if (user.isAdmin) {
      router.push("/admin")
      return
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleCategorySelect = (category: "natural" | "social") => {
    router.push(`/courses?category=${category}`)
  }

  if (!user) return null

  const trialProgress = (user.trialVideosWatched / user.maxTrialVideos) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EduLearn</span>
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
        {/* Trial Status */}
        {user.subscriptionStatus === "trial" && (
          <Card className="mb-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-orange-600" />
                Free Trial Status
              </CardTitle>
              <CardDescription>
                You have watched {user.trialVideosWatched} of {user.maxTrialVideos} free videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={trialProgress} className="mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                {user.maxTrialVideos - user.trialVideosWatched} videos remaining in your free trial
              </p>
              <Button onClick={() => router.push("/subscription")}>Upgrade to Premium</Button>
            </CardContent>
          </Card>
        )}

        {/* Categories Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Learning Path</h1>
          <p className="text-muted-foreground mb-6">Select a category to explore our comprehensive course library</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Natural Sciences */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
              onClick={() => handleCategorySelect("natural")}
            >
              <CardHeader className="pb-4">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  <img
                    src="/mathematics-textbook.png"
                    alt="Natural Sciences"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardTitle className="text-2xl">Natural Sciences</CardTitle>
                <CardDescription>Mathematics, Physics, Chemistry, Biology and more</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {mockCourses.filter((c) => c.category === "natural").length} Courses
                    </span>
                  </div>
                  <Badge variant="secondary">Popular</Badge>
                </div>
                <Button className="w-full group-hover:bg-primary/90">
                  <Play className="h-4 w-4 mr-2" />
                  Explore Courses
                </Button>
              </CardContent>
            </Card>

            {/* Social Sciences */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
              onClick={() => handleCategorySelect("social")}
            >
              <CardHeader className="pb-4">
                <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  <img
                    src="/ancient-history-books.jpg"
                    alt="Social Sciences"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardTitle className="text-2xl">Social Sciences</CardTitle>
                <CardDescription>History, Psychology, Sociology, Economics and more</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {mockCourses.filter((c) => c.category === "social").length} Courses
                    </span>
                  </div>
                  <Badge variant="secondary">New</Badge>
                </div>
                <Button className="w-full group-hover:bg-primary/90">
                  <Play className="h-4 w-4 mr-2" />
                  Explore Courses
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockCourses.length}</div>
              <p className="text-xs text-muted-foreground">Available for learning</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos Watched</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.trialVideosWatched}</div>
              <p className="text-xs text-muted-foreground">In your learning journey</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.trialVideosWatched * 45}m</div>
              <p className="text-xs text-muted-foreground">Total watch time</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
