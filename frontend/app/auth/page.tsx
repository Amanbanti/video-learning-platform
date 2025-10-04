"use client"

import { useState } from "react"
import { LoginForm } from "../../components/auth/login-form"
import { RegisterForm } from "../../components/auth/register-form"
import { Button } from "../../components/ui/button"
import Header from "../../components/Header"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
     <Header />

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {isLogin ? <LoginForm /> : <RegisterForm />}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="p-0 h-auto font-normal cursor-pointer">
              {isLogin ? "Sign up here" : "Sign in here"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
