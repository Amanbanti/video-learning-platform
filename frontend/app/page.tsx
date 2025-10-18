"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { BookOpen, Users, Video, Star, ArrowRight, Play } from "lucide-react"
import { getCurrentUser } from "../lib/auth"
import Header from "../components/Header"

export default function HomePage() {
  const [user, setUser] = useState(getCurrentUser())
  const router = useRouter()


  const handleGetStarted = () => {
    if (user) {
      if (user.isAdmin) {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } else {
      router.push("/auth")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            Premium Video Learning Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Master Natural & Social Sciences with Expert-Led Courses
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Access high-quality video courses designed by experts. Start with our free trial and unlock your learning
            potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 cursor-pointer">
              <Play className="mr-2 h-5 w-5" />
              Start Learning Now
            </Button>
        
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose EduLearn?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with expert instruction to deliver an unparalleled learning
              experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>High-Quality Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Professional video production with clear explanations and visual aids to enhance your learning
                  experience.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Expert Instructors</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Learn from industry professionals and academic experts with years of teaching and practical
                  experience.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Flexible Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Study at your own pace with lifetime access to course materials and mobile-friendly platform.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already transformed their understanding of natural and social sciences.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 cursor-pointer">
            Get Started Today
          </Button>
        </div>
      </section>
    </div>
  )
}
