"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { ThemeToggle } from "../../components/theme-toggle"
import { BookOpen, LogOut, ArrowLeft, Check, Upload, CreditCard, Smartphone, AlertCircle } from "lucide-react"
import { getCurrentUser, logout, setCurrentUser } from "../../lib/auth"
import Header from "../../components/Header"

export default function SubscriptionPage() {
  const [user, setUser] = useState(getCurrentUser())
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly")
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "cbe">("telebirr")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    if (user.subscriptionStatus === "active") {
      router.push("/dashboard")
      return
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
    }
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!receiptFile || !user) return

    setIsSubmitting(true)

    // Simulate payment submission
    setTimeout(() => {
      const updatedUser = {
        ...user,
        subscriptionStatus: "pending" as const,
      }
      setCurrentUser(updatedUser)
      setUser(updatedUser)
      setSubmitSuccess(true)
      setIsSubmitting(false)
    }, 2000)
  }

  if (!user) return null

  const plans = {
    monthly: {
      price: 299,
      period: "month",
      savings: null,
    },
    yearly: {
      price: 2990,
      period: "year",
      savings: "17% off",
    },
  }

  const paymentNumbers = {
    telebirr: "+251-911-123456",
    cbe: "+251-911-654321",
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <Header />

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Payment Submitted Successfully!</h1>
            <p className="text-muted-foreground mb-8">
              Your payment receipt has been submitted for review. Our admin team will verify your payment within 24
              hours. You'll receive access to all premium content once approved.
            </p>
            <div className="space-y-4">
              <Button onClick={() => router.push("/dashboard")} className="w-full sm:w-auto">
                Back to Dashboard
              </Button>
              <p className="text-sm text-muted-foreground">Questions? Contact support at support@edulearn.com</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Upgrade to Premium</h1>
            <p className="text-muted-foreground">Get unlimited access to all courses and premium content</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Plan Selection */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Plan</CardTitle>
                  <CardDescription>Select the subscription plan that works best for you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Monthly Plan */}
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPlan === "monthly"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedPlan("monthly")}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Monthly Plan</h3>
                        <p className="text-sm text-muted-foreground">Pay monthly, cancel anytime</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{plans.monthly.price} ETB</div>
                        <div className="text-sm text-muted-foreground">per month</div>
                      </div>
                    </div>
                  </div>

                  {/* Yearly Plan */}
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all relative ${
                      selectedPlan === "yearly"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedPlan("yearly")}
                  >
                    <Badge className="absolute -top-2 -right-2">Best Value</Badge>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Yearly Plan</h3>
                        <p className="text-sm text-muted-foreground">Save money with annual billing</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{plans.yearly.price} ETB</div>
                        <div className="text-sm text-muted-foreground">per year</div>
                        <Badge variant="secondary" className="mt-1">
                          {plans.yearly.savings}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Premium Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Unlimited access to all courses",
                      "HD video quality",
                      "Download for offline viewing",
                      "Priority customer support",
                      "New courses added monthly",
                      "Certificate of completion",
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Choose your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Telebirr */}
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === "telebirr"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setPaymentMethod("telebirr")}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">Telebirr</h3>
                        <p className="text-sm text-muted-foreground">Mobile payment</p>
                      </div>
                    </div>
                  </div>

                  {/* CBE Birr */}
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === "cbe" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setPaymentMethod("cbe")}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">CBE Birr</h3>
                        <p className="text-sm text-muted-foreground">Bank transfer</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Follow these steps to complete your payment:</AlertDescription>
                  </Alert>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Send payment to:</p>
                        <p className="text-muted-foreground">{paymentNumbers[paymentMethod]}</p>
                        <p className="font-medium mt-1">Amount: {plans[selectedPlan].price} ETB</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                        2
                      </div>
                      <p>Take a screenshot of the payment confirmation</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                        3
                      </div>
                      <p>Upload the screenshot below and submit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Payment Receipt</CardTitle>
                  <CardDescription>Upload a screenshot of your payment confirmation</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitPayment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="receipt">Payment Receipt *</Label>
                      <Input id="receipt" type="file" accept="image/*" onChange={handleFileUpload} required />
                      {receiptFile && <p className="text-sm text-muted-foreground">Selected: {receiptFile.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea id="notes" placeholder="Any additional information about your payment..." rows={3} />
                    </div>

                    <Button type="submit" className="w-full" disabled={!receiptFile || isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Upload className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Submit Payment Receipt
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
