"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import { register, verifyOtp } from "@/lib/auth"
import { Eye, EyeOff } from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [freshOrRemedial, setFreshOrRemedial] = useState<"Fresh Man" | "Remedial" | null>(null)
  const [naturalOrSocial, setNaturalOrSocial] = useState<"Natural" | "Social" | null>(null)
  const [verificationCode, setVerificationCode] = useState("")

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (error) {
      toast.error(error, { duration: 5000 })
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (step === 1) {
      if (!name || !email || !password || !confirmPassword) {
        toast.error("Please fill in all fields");
        return;
      }
      if (!email.includes("@")) {
        toast.error("Please enter a valid email address");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      setStep(2);
      return;
    }
  
    if (step === 2) {
      if (!freshOrRemedial) {
        toast.error("Please select Fresh Man or Remedial");
        return;
      }
      setStep(3);
      return;
    }
  
    if (step === 3) {
      if (!naturalOrSocial) {
        toast.error("Please select Natural or Social");
        return;
      }
  
      // REGISTER USER AND SEND OTP
      try {
        setIsLoading(true);
        await register(email, password, name, freshOrRemedial!, naturalOrSocial!);
        toast.success("Verification code sent to your email!");
        setStep(4); // move to OTP input
      } catch (err: any) {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
      return;
    }
  
    if (step === 4) {
      if (!verificationCode) {
        toast.error("Please enter the verification code");
        return;
      }
  
      try {
        setIsLoading(true);
        const result = await verifyOtp(email, verificationCode); // verify OTP
        if (result.message === "User verified successfully") {
          toast.success("Account created successfully!");
          onSuccess?.();
          router.push("/dashboard");
        } else {
          setError(result.message || "Verification failed");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Verification failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
        <CardDescription className="text-center">
          {step === 1 && "Create your account to start learning"}
          {step === 2 && "Choose your Education Level"}
          {step === 3 && "Select your stream"}
          {step === 4 && "Enter the verification code sent to your email"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-500 cursor-pointer" /> : <Eye className="h-5 w-5 text-gray-500 cursor-pointer" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-500 cursor-pointer" /> : <Eye className="h-5 w-5 text-gray-500 cursor-pointer" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant={freshOrRemedial === "Fresh Man" ? "default" : "outline"}
                onClick={() => setFreshOrRemedial("Fresh Man")}
                className="cursor-pointer dark:text-white dark:hover:bg-accent"
              >
                Fresh Man
              </Button>
              <Button
                type="button"
                variant={freshOrRemedial === "Remedial" ? "default" : "outline"}
                onClick={() => setFreshOrRemedial("Remedial")}
                className="cursor-pointer dark:text-white dark:hover:bg-accent"
              >
                Remedial
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant={naturalOrSocial === "Natural" ? "default" : "outline"}
                onClick={() => setNaturalOrSocial("Natural")}
                className="cursor-pointer dark:text-white dark:hover:bg-accent"
              >
                Natural
              </Button>
              <Button
                type="button"
                variant={naturalOrSocial === "Social" ? "default" : "outline"}
                onClick={() => setNaturalOrSocial("Social")}
                className="cursor-pointer dark:text-white dark:hover:bg-accent"
              >
                Social
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter the code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
            {step === 1 && (isLoading ? "Checking..." : "Next")}
            {step === 2 && "Next"}
            {step === 3 && "Next"}
            {step === 4 && (isLoading ? "Verifying..." : "Sign Up")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
