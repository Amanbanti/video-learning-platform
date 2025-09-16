"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EduLearn</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {isLogin ? <LoginForm /> : <RegisterForm />}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="p-0 h-auto font-normal">
              {isLogin ? "Sign up here" : "Sign in here"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
