"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { BookOpen, Play, Clock, LoaderCircle } from "lucide-react"
import { getCurrentUser} from "../../lib/auth"
import {mockCourses} from "../../lib/course"
import Header from "../../components/Header"
import {fetchCourseByCategory} from "../../lib/course"
import toast from "react-hot-toast"


export default function CoursesPage() {
  const [user, setUser] = useState(getCurrentUser())
  const router = useRouter()
  const searchParams = useSearchParams()

  const [Loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<typeof mockCourses>([])

  const allCategories = [
    "Natural-FreshMan",
    "Natural-Remedial",
    "Social-FreshMan",
    "Social-Remedial",
    "Common",
  ]

  const category = searchParams?.get("category") as (typeof allCategories)[number] | null


  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
  
    const fetchCourses = async () => {
      try {
        setLoading(true);
  
        if (category) {
          if (allCategories.includes(category)) {
            const data = await fetchCourseByCategory(category as any);
            setCourses(data);
          } else {
            toast.error("Invalid category selected.");
          }
        } else {
          toast.error("Category doesn't exist.");
          router.push("/dashboard");
        }
      } catch (error) {
        toast.error("Failed to fetch courses. Please try again later.");
        console.error("Error fetching courses by category:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCourses();
  }, [user, router, category]);
  

  const handleCourseSelect = (courseId: string) => {
    router.push(`/course/${courseId}`)
  }

  if (!user) return null


    if (Loading) {
      return (
        <div>
            <Header/>
            <div className="flex justify-center items-center py-10 w-full col-span-full">
              <LoaderCircle className="h-18 w-18 animate-spin text-primary" />
            </div>
        </div>
        
      )
    }



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{category}</h1>
          <p className="text-muted-foreground">
          {(category === "Natural-FreshMan" || category === "Natural-Remedial") && (
              "Explore mathematics, physics, chemistry, and other natural sciences"
            )}

            {(category === "Social-FreshMan" || category === "Social-Remedial") && (
              "Discover history, psychology, sociology, and other social sciences"
            )}
            {category === "Common" && (
              "Browse courses that are relevant to all students, regardless of their specialization"
            )}                  
          </p>
        </div>


       {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Loading ? (
            <div className="flex justify-center items-center py-10 w-full col-span-full">
              <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : courses && courses.length > 0 ? (
            courses.map((course) => {
              const imageUrl = course.coverImageUrl?.split("\\").join("/");

              return (
                <Card
                  key={course._id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                  onClick={() => handleCourseSelect(course._id)}
                >
                  <CardHeader className="pb-4">
                    <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      <img
                        src={imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}/${imageUrl}` : "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge>{course.category}</Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
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
                            {course.chapters.reduce((total, chapter) => total + parseInt(chapter.duration), 0)} mins
                            
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full group-hover:bg-primary/90 cursor-pointer">
                      <Play className="h-4 w-4 mr-2" />
                      Start Course
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12 col-span-full">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground">
                There are no courses available in this category yet.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
