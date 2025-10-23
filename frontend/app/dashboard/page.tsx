"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Progress } from "../../components/ui/progress"
import { BookOpen, Play, Clock, Star, LoaderCircle } from "lucide-react"
import { getCurrentUser } from "../../lib/auth"
import Header from "../../components/Header"
import {countCoursesByCategory} from "../../lib/course"

export default function DashboardPage() {
  const [user, setUser] = useState(getCurrentUser())
  const [userCategories, setUserCategories] = useState("")
  const [commonCategory, setCommonCategory] = useState("")

  const [countUserCourses, setCountUserCourses] = useState<number>(0)
  const [countCommonCourses, setCountCommonCourses] = useState<number>(0)
  const [Loading, setLoading] = useState(false)

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

  const allCategories = [
    "Natural-FreshMan",
    "Natural-Remedial",
    "Social-FreshMan",
    "Social-Remedial",
    "Common",
  ]

  // Build allowed categories based on user info
  useEffect(() => {
    if (!user) return
  
    const userMainCategory = user.naturalOrSocial
    const userSubCategory = user.freshOrRemedial
  
    let category = ""
  
    if (userMainCategory === "Natural" && userSubCategory === "Fresh Man") {
      category = "Natural-FreshMan"
    } else if (userMainCategory === "Natural" && userSubCategory === "Remedial") {
      category = "Natural-Remedial"
    } else if (userMainCategory === "Social" && userSubCategory === "Fresh Man") {
      category = "Social-FreshMan"
    } else if (userMainCategory === "Social" && userSubCategory === "Remedial") {
      category = "Social-Remedial"
    }
  
    setUserCategories(category)
    setCommonCategory("Common")
  }, [user])
  


  useEffect(() => {
    if (!userCategories) return
  
    ;(async () => {
      try {
        setLoading(true)
        const data = await countCoursesByCategory(userCategories as any)
        setCountUserCourses(data.count || 0)
        setCountCommonCourses(data.common || 0)
      } catch (error) {
        console.error("Error fetching course counts:", error)
      }finally{
        setLoading(false)
      }
    })()
  }, [userCategories])
  





  const handleCategorySelect = (category: string) => {
    router.push(`/courses?category=${category}`)
  }

  if (!user) return null


  const trialProgress = (user.trialVideosWatched / user.maxTrialVideos) * 100


  if (Loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header/>
        <div className="flex justify-center items-center py-10 w-full col-span-full">
          <LoaderCircle className="h-18 w-18 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Trial Status */}
        {user.subscriptionStatus === "Trial" && (
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
              <Button className="cursor-pointer" onClick={() => router.push("/subscription")}>Upgrade to Premium</Button>
            </CardContent>
          </Card>
        )}
          
          
      <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Choose Your Category</h1>
                <p className="text-muted-foreground mb-6">Select a category to explore our comprehensive courses</p>


       {/* Categories Section */}
      
              <div className="grid md:grid-cols-2 gap-6">
                {userCategories && (
                  <Card
                    key={userCategories}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                    onClick={() => handleCategorySelect(userCategories)}
                  >
                    <CardHeader className="pb-4">
                      <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        <img
                          src={user.naturalOrSocial === "Natural" ? "/physics-laboratory.png" : "/ancient-history-books.jpg"}
                          alt={userCategories}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardTitle className="text-2xl">{userCategories}</CardTitle>
                      <CardDescription>
                        {user.naturalOrSocial === "Natural"
                          ? "Mathematics, Physics, Chemistry, Biology and more"
                          : "History, Psychology, Sociology, Economics and more"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{countUserCourses} Courses</span>
                        </div>
                      </div>
                      <Button className="w-full cursor-pointer group-hover:bg-primary/90">
                        <Play className="h-4 w-4 mr-2" />
                        Explore Courses
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {commonCategory && (
                  <Card
                    key={commonCategory}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                    onClick={() => handleCategorySelect(commonCategory)}
                  >
                    <CardHeader className="pb-4">
                      <div className="h-48 bg-gradient-to-br from-yellow-100 to-red-100 dark:from-yellow-900/20 dark:to-red-900/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        <img
                          src="/images.webp"
                          alt={commonCategory}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardTitle className="text-2xl">{commonCategory}</CardTitle>
                      <CardDescription>Common courses accessible to all students</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{countCommonCourses} Courses</span>
                        </div>
                      </div>
                      <Button className="w-full group-hover:bg-primary/90 cursor-pointer">
                        <Play className="h-4 w-4 mr-2" />
                        Explore Courses
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
       </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countCommonCourses + countUserCourses}</div>
              <p className="text-xs text-muted-foreground">Available for learning</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )

}

