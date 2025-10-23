"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import Link from "next/link"
import { toast } from "react-hot-toast"

import { handleEmailSubmit as sendOtp, handleOtpSubmit as verifyOtp, handlePasswordReset as resetPassword } from "../../lib/auth"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState<"email" | "otp" | "reset">("email")
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const router = useRouter()

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
  
      return () => clearInterval(timer)
    }
  }, [resendTimer])
  

  // STEP 1: Send OTP
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
  
      await sendOtp(email) // ✅ use your helper function here
  
      toast.success("Verification code sent to your email.")
      setStep("otp")
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to send verification code. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  

  // STEP 2: Verify OTP
 const handleOtpSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    setIsLoading(true)

    await verifyOtp(email, otp) // ✅ call your API

    toast.success("OTP verified successfully! You can now reset your password.")
    setStep("reset")
  } catch (error: any) {
    toast.error(
      error.response?.data?.message ||
        error.message ||
        "Verification failed. Please try again."
    )
  } finally {
    setIsLoading(false)
  }
}




  // STEP 3: Reset Password
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }
  
    try {
      setIsLoading(true)
  
      await resetPassword(email, password) // ✅ call your API
  
      toast.success("Password reset successfully!")
      setStep("email")
      setEmail("")
      setOtp("")
      setPassword("")
      setConfirmPassword("")
      router.push("/auth")
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to reset password. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-md border border-gray-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {step === "email"
              ? "Forgot Password"
              : step === "otp"
              ? "Verify Code"
              : "Reset Password"}
          </CardTitle>
          <CardDescription className="text-center text-gray-500">
            {step === "email"
              ? "Enter your email address and we’ll send you a verification code."
              : step === "otp"
              ? `Enter the 6-digit verification code sent to ${email}`
              : "Enter your new password below."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* STEP 1: Email */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
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

              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>

              <div className="text-center">
                <Link href="/auth" className="text-sm text-blue-600 hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                />
                </div>

                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Code"}
                </Button>

                <div className="text-center">
                <button
                    type="button"
                    disabled={resendTimer > 0 || isLoading}
                    onClick={async () => {
                    try {
                        setIsLoading(true)
                        await sendOtp(email) // 🔥 resend OTP
                        toast.success("New code sent to your email.")
                        setResendTimer(45) // start countdown
                    } catch (err: any) {
                        toast.error(err.response?.data?.message || "Failed to resend code.")
                    } finally {
                        setIsLoading(false)
                    }
                    }}
                    className={`text-sm hover:underline ${
                    resendTimer > 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600"
                    }`}
                >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                </button>
                </div>
            </form>
            )}


          {/* STEP 3: Reset Password */}
          {step === "reset" && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPassword
