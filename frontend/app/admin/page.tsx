"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Users, Video, CreditCard, Plus, Eye, Edit, Trash2, Check, X } from "lucide-react"
import { mockCourses, type PaymentRequest } from "../../lib/course"
import { getCurrentUser } from "../../lib/auth"
import Link from "next/link"

import Header from "../../components/Header"
import AddCourseDialog from "../../components/AddCourseDialog"

import { toast } from "react-hot-toast"
import {fetchCourses} from "../../lib/course"
import DashboardStats from "../../components/DashboardStats"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import  CourseCardSkeleton  from "../../components/CourseCardSkeleton"
import { Label } from "recharts"


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



// Category enum as a readonly tuple
export const categoryEnum = [
  "Natural-FreshMan",
  "Natural-Remedial",
  "Social-FreshMan",
  "Social-Remedial",
  "Common",
] as const;

export type CategoryEnum = typeof categoryEnum[number];

// Chapter interface
export interface Chapter {
  _id: string;
  title: string;
  videoUrl: string;
  duration: string;
  description: string;
}
// Course interface
export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  coverImageUrl: string;
  category: CategoryEnum;
  chapters: Chapter[];
}

export default function AdminPage() {


  const [user, setUser] = useState(getCurrentUser())
  const [paymentRequests, setPaymentRequests] = useState(mockPaymentRequests)

  const [activeTab, setActiveTab] = useState("payments");
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);


  const [coursePage, setCoursePage] = useState(1); // pagination
  const [category, setCategory] = useState(""); 


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



  useEffect(() => {
    if (activeTab !== "courses") return;
  
    const load = async () => {
      try {
        setCourseLoading(true);
  
        // Convert "all" to empty string for API
        const categoryParam = category === "all" ? "" : category;
  
        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 500));
  
        const fetchedCourses = await fetchCourses(coursePage, 10, categoryParam);
        setCourses(fetchedCourses);
      } catch (err) {
        toast.error("Error fetching courses. Please try again.");
        console.error("Error fetching courses:", err);
      } finally {
        setCourseLoading(false);
      }
    };
  
    load();
  }, [activeTab, coursePage, category]);

  useEffect(() => {
    setCoursePage(1); // reset page when category changes
  }, [category]);

  



  const handlePaymentAction = (requestId: string, action: "approve" | "reject") => {
    setPaymentRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: action === "approve" ? "approved" : "rejected" } : req,
      ),
    )
  }

  if (!user || !user.isAdmin) return null


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <DashboardStats />
       

        {/* Main Content */}
        <Tabs  value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger className="cursor-pointer" value="payments">Payment Requests</TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="courses">Course Management</TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="users">User Management</TabsTrigger>
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
                <p className="text-muted-foreground">Manage your course </p>
              </div>

              {/* Category Filter */}
              <div className="w-48">
                  <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category" className="w-full cursor-pointer">
                    <SelectValue placeholder="Search by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key={0} value={"all"}  className="cursor-pointer">
                      All Courses
                      </SelectItem>
                    {categoryEnum.map((cat) => (
                      <SelectItem key={cat} value={cat}  className="cursor-pointer">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                </div>
              

              <AddCourseDialog/>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {courseLoading ? (
                  <CourseCardSkeleton />
                ) : courses.length === 0 && coursePage === 1 ? (
                  <div className="col-span-3 text-center text-muted-foreground">
                    No courses found. Try adding some courses.
                  </div>
                ) : (
                  courses.map((course) => {
                    const imageUrl = course.coverImageUrl?.split("\\").join("/");
  
                        return (
                          <Card key={course._id}>
                            <CardHeader className="pb-4">
                              <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                <img
                                  src={imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}/${imageUrl}` : "/placeholder.svg"}
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">Category:  <Badge className="w-fit">{course.category}</Badge> </span>
                              <CardTitle className="text-lg">{course.title}</CardTitle>
                              <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-muted-foreground">{course.chapters.length} chapters</span>
                              </div>
                              <div className="flex space-x-2">
                              <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 bg-transparent cursor-pointer"
                                  onClick={() => router.push(`/addchapter/${course?._id}`)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>

                                <Button size="sm" variant="outline" className="flex-1 bg-transparent cursor-pointer">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button size="sm" variant="destructive" className="cursor-pointer">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
               
                  
                   
                  )}
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
