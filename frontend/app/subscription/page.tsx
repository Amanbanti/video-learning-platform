"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Check, Upload, CreditCard, Smartphone, AlertCircle, Clock } from "lucide-react"
import { getCurrentUser, getUserById } from "../../lib/auth"
import Header from "../../components/Header"
import toast from "react-hot-toast"

import { paymentSubmission } from "../../lib/auth"

export default function SubscriptionPage() {
  const [user, setUser] = useState(getCurrentUser())
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "cbe" | "cbeBirr">("telebirr")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {

    const fetchAndSyncUser = async () => {
      if (!user) {
        router.push("/auth");
        return;
      }

      if (user?.isAdmin) {
        router.push("/admin");
        return;
      }

      try {
    
        const res = await getUserById(user._id); 
        
        if (res) {
          
          const currentSessionString = localStorage.getItem("currentUser");
          let currentSessionData = {};

          // 2. Parse it safely
          if (currentSessionString) {
            try {
              currentSessionData = JSON.parse(currentSessionString);
            } catch (e) {
              console.error("Failed to parse localStorage data:", e);
            }
          }

          // 3. Merge old data (with timestamp) and new user data
          const newSessionData = {
            ...currentSessionData, // Preserves the 'timestamp' key
            user: res, // Updates the 'user' key with fresh data
          };

          // 4. Save the merged object back
          localStorage.setItem("currentUser", JSON.stringify(newSessionData));
          

          setUser(res);
        }
      } catch (error) {
        console.error("Failed to sync user data:", error);
      }
    };

    fetchAndSyncUser();

  
  }, [ router]); 



  if (!user) return null

  const paymentNumbers = {
    telebirr: "0941670553",
    cbe: "1000221323212",
    cbeBirr: "0941670553"
  }

  const paidTo = "Amanuel Assfawu"

  const oneTimePrice = 999 // ETB



  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setReceiptFile(file)
  }

  

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile || !user || !phoneNumber) {
      toast.error("Please provide all required information.");
      return;
    }
  
    try {
      setIsSubmitting(true);
      // Call API request helper
      await paymentSubmission(
        user._id,
        receiptFile,
        paymentMethod,
        oneTimePrice,
        phoneNumber
      );
  
      // 1. Create the user object with the new status
      const updatedUser = {
        ...user,
        subscriptionStatus: "Pending" as const,
      };
  
      // 2. Get the *full* current session data from localStorage
      const currentSessionString = localStorage.getItem("currentUser");
      let currentSessionData = {};
  
      if (currentSessionString) {
        try {
          currentSessionData = JSON.parse(currentSessionString);
        } catch (parseError) {
          console.error("Failed to parse localStorage data:", parseError);
          // Handle case where localStorage is corrupted, though unlikely
        }
      }
  
      // 3. Create the new session data, merging the old data (with timestamp)
      //    and the new updatedUser object.
      const newSessionData = {
        ...currentSessionData, // This preserves the 'timestamp' key
        user: updatedUser, // This updates *only* the 'user' key
      };
  
      // 4. Save the complete, merged object back to localStorage
      localStorage.setItem("currentUser", JSON.stringify(newSessionData));
  
      // 5. Update your React state
      setUser(updatedUser);
  
      toast.success(
        "Payment submitted successfully! Please wait for verification."
      );
    } catch (err: any) {
      console.error("Error submitting payment receipt:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit payment receipt. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  


  // ✅ Premium user UI
  if (user.subscriptionStatus === "Active") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
          <div className="h-20 w-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold">You’re a Premium User 🎉</h1>
          <p className="text-muted-foreground max-w-md">
            Enjoy full access to all premium content for life. Thank you for supporting us!
          </p>
          <Button className="cursor-pointer" onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  // ⚠️ Pending user UI
  if (user.subscriptionStatus === "Pending") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
          <div className="h-20 w-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
            <Clock className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold">Payment Pending ⏳</h1>
          <p className="text-muted-foreground max-w-md">
            We’ve received your payment receipt. Our team will verify it within 24 hours. You’ll get full access once
            confirmed.
          </p>
          <Button onClick={() => router.push("/dashboard")} className="cursor-pointer" variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // 💳 One-time payment form
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">Unlock Premium Access</h1>
          <p className="text-muted-foreground">Pay once and enjoy lifetime access to all premium courses.</p>
        </div>

        <div className="max-w-3xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>One-Time Payment</CardTitle>
              <CardDescription>Lifetime access for a single payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 text-center">
                <h2 className="text-4xl font-bold">{oneTimePrice} ETB</h2>
                <p className="text-sm text-muted-foreground mt-2">Pay once. No monthly or yearly fees.</p>
              </div>

              <div className="space-y-2">
                <Label>Choose Payment Method</Label>
                <div className="flex flex-col gap-3">
                  {/*CBE */}
                <div
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === "cbe"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setPaymentMethod("cbe")}
                  >
                    <div className="flex items-center gap-3 pb-3">
                      <CreditCard className="h-6 w-6 text-primary" />
                      <span className="font-medium">CBE — {paymentNumbers.cbe}</span>
                     
                    </div>
                    <span className="ml-auto">Paid to: {paidTo}</span>
                  </div>
                  {/* Telebirr */}
                  <div
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === "telebirr"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setPaymentMethod("telebirr")}
                  >
                    <div className="flex items-center gap-3 pb-3">
                      <Smartphone className="h-6 w-6 text-primary" />
                      <span className="font-medium">Telebirr — {paymentNumbers.telebirr}</span>
                     
                    </div>
                    <span className="ml-auto pt-10">Paid to: {paidTo}</span>
                  </div>

                  {/* CBE-birr */}
                  <div
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === "cbeBirr"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setPaymentMethod("cbeBirr")}
                  >
                    <div className="flex items-center gap-3 pb-3">
                      <CreditCard className="h-6 w-6 text-primary" />
                      <span className="font-medium">CBE Birr — {paymentNumbers.cbeBirr}</span>
                     
                    </div>
                    <span className="ml-auto">Paid to: {paidTo}</span>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Send exactly <b>{oneTimePrice} ETB</b> to the selected account and upload your payment screenshot below.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Upload Receipt */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Payment Receipt</CardTitle>
              <CardDescription>Submit a screenshot of your payment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="receipt">Payment Receipt *</Label>
                  <Input
                    id="receipt"
                    name="paymentReceipt"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    required
                  />
                  {receiptFile && <p className="text-sm text-muted-foreground">Selected: {receiptFile.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Phone number *</Label>
                  <Input
                    id="phoneNumber"
                    type="text"
                    placeholder="Your phone number used in the payment"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}                    
                    required
                  />
                </div>

                <Button type="submit" className="w-full cursor-pointer cursor-pointer" disabled={!receiptFile || !phoneNumber || isSubmitting}>
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
  )
}
