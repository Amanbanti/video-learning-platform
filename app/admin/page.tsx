"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { BookOpen, LogOut, Users, Video, CreditCard, Plus, Eye, Edit, Trash2, Check, X } from "lucide-react"
import { getCurrentUser, logout, mockCourses, type PaymentRequest } from "@/lib/auth"

// Mock payment requests data
const mockPaymentRequests: PaymentRequest[] = [
  {
    id: "1",
    userId: "user1",
    amount: 299,
    paymentMethod: "telebirr",
    receiptImage: "/placeholder.svg?height=200&width=300",
    status: "pending",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    userId: "user2",
    amount: 2990,
    paymentMethod: "cbe",
    receiptImage: "/placeholder.svg?height=200&width=300",
    status: "pending",
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "3",
    userId: "user3",
    amount: 299,
    paymentMethod: "telebirr",
    receiptImage: "/placeholder.svg?height=200&width=300",
    status: "approved",
    createdAt: new Date("2024-01-13"),
  },
]

export default function AdminPage() {
  const [user, setUser] = useState(getCurrentUser())
  const [paymentRequests, setPaymentRequests] = useState(mockPaymentRequests)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    if (!user.isAdmin) {
      router.push("/dashboard")
      return
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handlePaymentAction = (requestId: string, action: "approve" | "reject") => {
    setPaymentRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: action === "approve" ? "approved" : "rejected" } : req,
      ),
    )
  }

  if (!user || !user.isAdmin) return null

  const pendingPayments = paymentRequests.filter((req) => req.status === "pending")
  const totalUsers = 156 // Mock data
  const totalRevenue = paymentRequests
    .filter((req) => req.status === "approved")
    .reduce((sum, req) => sum + req.amount, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EduLearn Admin</span>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockCourses.length}</div>
              <p className="text-xs text-muted-foreground">Across all categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPayments.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} ETB</div>
              <p className="text-xs text-muted-foreground">From approved payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payments">Payment Requests</TabsTrigger>
            <TabsTrigger value="courses">Course Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          {/* Payment Requests Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Requests</CardTitle>
                <CardDescription>Review and approve user payment submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-24 bg-muted rounded-lg overflow-hidden">
                          <img
                            src={request.receiptImage || "/placeholder.svg"}
                            alt="Payment receipt"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">User ID: {request.userId}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.amount} ETB via {request.paymentMethod}
                          </p>
                          <p className="text-xs text-muted-foreground">{request.createdAt.toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            request.status === "approved"
                              ? "default"
                              : request.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {request.status}
                        </Badge>

                        {request.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => handlePaymentAction(request.id, "approve")}>
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handlePaymentAction(request.id, "reject")}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Course Management Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Course Management</h2>
                <p className="text-muted-foreground">Manage your course library</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Course
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCourses.map((course) => (
                <Card key={course.id}>
                  <CardHeader className="pb-4">
                    <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Badge variant={course.category === "natural" ? "default" : "secondary"} className="w-fit">
                      {course.category === "natural" ? "Natural" : "Social"}
                    </Badge>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">{course.chapters.length} chapters</span>
                      {course.isPremium && <Badge variant="outline">Premium</Badge>}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock user data */}
                  {[
                    { id: "1", name: "John Doe", email: "john@example.com", status: "active", joinDate: "2024-01-10" },
                    { id: "2", name: "Jane Smith", email: "jane@example.com", status: "trial", joinDate: "2024-01-12" },
                    {
                      id: "3",
                      name: "Bob Johnson",
                      email: "bob@example.com",
                      status: "pending",
                      joinDate: "2024-01-14",
                    },
                  ].map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Joined: {user.joinDate}</p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Badge
                          variant={
                            user.status === "active" ? "default" : user.status === "trial" ? "secondary" : "outline"
                          }
                        >
                          {user.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
