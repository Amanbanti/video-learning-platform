"use client"

import type React from "react"

import { useState,useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { getCurrentUser, login } from "../../lib/auth"
import { toast } from "react-hot-toast"
import { Eye, EyeOff } from "lucide-react"

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {

  const user = getCurrentUser()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

    useEffect(() => {
      if (error) {
        toast.error(error, { duration: 5000 })
      }
      if(user){
        router.push(user.isAdmin ? "/admin" : "/dashboard")
      }
    }, [error,user,router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      const user = await login(email, password)
      if (user) {
        toast.success("Login successful", { duration: 3000 })
        onSuccess?.()
        if (user.isAdmin) {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      } else {
        setError("Invalid email or password")
      }
    } catch (err: any) {
  
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed! Please try again.";
      setError(message); 
    }  finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
        <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
              
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 pt-5"
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-500 cursor-pointer" /> : <Eye className="h-5 w-5 text-gray-500 cursor-pointer" />}
            </button>
          </div>

          <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

      </CardContent>
    </Card>
  )
}
