"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import {Eye, Edit, Trash2, Check, X, Search, Users } from "lucide-react"
import { mockCourses, type PaymentRequest,deleteCourse } from "../../lib/course"
import { getCurrentUser } from "../../lib/auth"
import { LoaderCircle } from "lucide-react"

import Header from "../../components/Header"
import AddCourseDialog from "../../components/AddCourseDialog"
import EditCourse from "../../components/EditCourse"

import { toast } from "react-hot-toast"
import {fetchCourses} from "../../lib/course"
import {getAllUsers,updateUserSubscription} from "../../lib/auth"
import DashboardStats from "../../components/DashboardStats"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import  CourseCardSkeleton  from "../../components/CourseCardSkeleton"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { DialogHeader } from "../../components/ui/dialog"
import {fetchPendingUserPayments} from "../../lib/auth"
import {
  Pagination,
  PaginationContent,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"

import { changeSubscriptionStatus } from "../../lib/auth"
import { fi } from "date-fns/locale"







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


export interface User {
  _id: string
  email: string
  name: string
  isAdmin: boolean
  subscriptionStatus: "Trial" | "Pending" | "Active"
  password: string
  trialVideosWatched: number
  maxTrialVideos: number
  paymentReceipt?: string
  naturalOrSocial: "Natural" | "Social";
  freshOrRemedial: "Fresh Man" | "Remedial";
  paymentMethod?:string
  paymentAmount?:number
  paymentDate?:Date
  payerPhoneNumber?:string


}

export default function AdminPage() {


  const [user, setUser] = useState(getCurrentUser())

  const [activeTab, setActiveTab] = useState("payments");
  

  //course states
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [coursePage, setCoursePage] = useState(1); // pagination
  const [category, setCategory] = useState(""); 
  const [onCourseUpdated, setOnCourseUpdated] = useState(false);
  const [onCourseCreated, setOnCourseCreated] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalPages, setTotalPages] = useState(1); // total pages for pagination
  const [currentPage, setCurrentPage] = useState(1); // current page from API



  //user states
  const [users, setUsersData] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userPage, setUserPage] = useState(1); // pagination
  const [userTotalPages, setUserTotalPages] = useState(1); // total pages for pagination
  const [userCurrentPage, setUserCurrentPage] = useState(1); // current page from API
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [paymentPendingLoading, setPaymentPendingLoading] = useState(false)
  const [paymentPendingLoading2, setPaymentPendingLoading2] = useState(false)

  const [paymentRequest, setPaymentRequest]=useState<User[]>([]);

  




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
  }, [user, router,activeTab])



  useEffect(() => {
    if (activeTab == "courses"){
      const load = async () => {
        try {
          setCourseLoading(true);
    
          // Convert "all" to empty string for API
          const categoryParam = category === "all" ? "" : category;
    
          // Simulate delay
          await new Promise((resolve) => setTimeout(resolve, 500));
    
          const fetchedCourses = await fetchCourses(coursePage, 5, categoryParam);
          setCourses(fetchedCourses.courses);
          setTotalPages(fetchedCourses.totalPages); 
          setCurrentPage(fetchedCourses.page);
        } catch (err) {
          toast.error("Error fetching courses. Please try again.");
          console.error("Error fetching courses:", err);
        } finally {
          setCourseLoading(false);
        }
      };
    
      load();

    }else if (activeTab == "users"){
      setUserLoading(true);
      const loadUsers = async () => {
        try {
          const userResponse = await getAllUsers(searchQuery,10,userPage);
          setUsersData(userResponse?.users || []);
          setUserTotalPages(userResponse?.totalPages || 1);
          setUserCurrentPage(userResponse?.page || 1);
        } catch (err) {
          toast.error("Error fetching users. Please try again.");
          console.error("Error fetching users:", err);
        }finally {
          setUserLoading(false);
        }
      };
    
      loadUsers();
    }else if(activeTab == "payments"){
      const pendingUsers = async () => {
        try{
          setPaymentPendingLoading(true)
          const payments = await fetchPendingUserPayments()
          setPaymentRequest(payments)
  
        }catch (error: any) {
                toast.error(
                  error.response?.data?.message || error.message || "Failed to update password."
                )
                console.error("Error fetching payment requests:", error)
        }finally{
                setPaymentPendingLoading(false) 
        }

      }

      pendingUsers()
      

    }
  
    
  }, [activeTab, coursePage,onCourseUpdated,onCourseCreated, category,userPage,searchQuery]);


  useEffect(() => {
    setCoursePage(1); // reset page when category changes
  }, [category]);

  



  const handlePaymentAction = async (requestId: string, action: "approve" | "reject") => {
    try {
      setPaymentPendingLoading2(true);
      // Update UI instantly (optimistic update)
      setPaymentRequest((prev) =>
        prev.map((req) =>
          req._id === requestId
            ? { ...req, subscriptionStatus: action === "approve" ? "Active" : "Trial" }
            : req
        )
      );
  
      await updateUserSubscription(requestId, {
        subscriptionStatus: action === "approve" ? "Active" : "Trial",
      });
  
      toast.success(
        action === "approve"
          ? "User subscription activated successfully!"
          : "User moved to trial successfully."
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update subscription status."
      );
      console.error("Error updating subscription:", error);
    }finally {
      setPaymentPendingLoading2(false);
    }
  };


  const handleSave = async (userId: string | undefined) => {
    try{
      setStatusLoading(true)
      if(!userId) {
        toast.error("User ID is missing. Please try again.")
        return
      }
      if(!selectedStatus) {
        toast.error("Please select a valid status.")
        return
      }
      await changeSubscriptionStatus(userId, selectedStatus)
      // Update local state to reflect change immediately
      setUsersData(prev =>
        prev.map(u => u._id === userId ? { ...u, subscriptionStatus: selectedStatus as "Trial" | "Active" } : u)
      )

      toast.success("Subscription status updated successfully")
    }catch(error){
      toast.error(String(error) || "Error updating subscription status. Please try again.")
      return
    }finally{
      setOpen(false)
      setStatusLoading(false)
    }
   
    
  }



  const handleOpenDialog = (userStatus: string, userID: string) => {
    if(userStatus === "Pending") {
      toast.error("Approve the payment request on Payment Request tap!")
      setOpen(false)
      return

    }
    setSelectedStatus(userStatus || "")
    setEditingUserId(userID || null)
    setOpen(true)
  }

  


  const handleDeleteCourse = (courseId: string) => {
      try {
        setIsDeleting(true);
        deleteCourse(courseId); // call the API to delete
      toast.success("Course deleted successfully");
      setCourses((prev) => prev.filter((course) => course._id !== courseId));
    } catch (error) {
       toast.error("Error deleting course. Please try again.");
    }finally {
        setIsDeleting(false);
    }
    
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
          <TabsTrigger className="cursor-pointer" value="payments">
            <span className="sm:hidden">Pay R</span>
            <span className="hidden sm:inline">Payment Requests</span>
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="courses">
            <span className="sm:hidden">Courses</span>
            <span className="hidden sm:inline">Course Management</span>
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="users">
            <span className="sm:hidden">Users</span>
            <span className="hidden sm:inline">User Management</span>
          </TabsTrigger>
        </TabsList>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Requests</CardTitle>
                <CardDescription>Review and approve user payment submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentPendingLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : paymentRequest.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">
                      No pending payment requests.
                    </p>
                  ) : (
                    paymentRequest.map((request) => {
                      const imageUrl = request.paymentReceipt?.split("\\").join("/") || "/placeholder.svg";

                      return (
                        <div
                        key={request._id}
                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg space-y-4 md:space-y-0"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 cursor-pointer w-full">
                          <div className="h-40 sm:h-16 w-full sm:w-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            <Dialog>
                              <DialogTrigger asChild>
                                <img
                                  src={imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}/${imageUrl}` : "/placeholder.svg"}
                                  alt="Payment receipt"
                                  className="w-full h-full object-cover cursor-pointer"
                                />
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-3xl p-0">
                                <DialogHeader>
                                  <DialogTitle>Payment Receipt</DialogTitle>
                                </DialogHeader>
                                <img
                                  src={imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}/${imageUrl}` : "/placeholder.svg"}
                                  alt="Payment receipt"
                                  className="w-full h-auto max-h-[80vh] object-contain"
                                />
                              </DialogContent>
                            </Dialog>
                          </div>
                      
                          <div className="flex-1 space-y-1">
                            <p className="text-sm text-muted-foreground">Name: {request.name}</p>
                            <p className="text-sm text-muted-foreground">Phone N0: {request.payerPhoneNumber}</p>
                            <p className="text-sm text-muted-foreground">User ID: {request._id}</p>
                            <p className="text-sm text-muted-foreground">
                              {request.paymentAmount} ETB via {request.paymentMethod}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {request.paymentDate
                                ? new Date(request.paymentDate).toLocaleDateString("en-US", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  })
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                          <Badge
                            variant={
                              request.subscriptionStatus === "Active"
                                ? "default"
                                : request.subscriptionStatus === "Trial"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {request.subscriptionStatus}
                          </Badge>
                      
                          {request.subscriptionStatus === "Pending" && (
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                              {/* Approve Button with Dialog */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" className="cursor-pointer w-full sm:w-auto">
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Approve Payment</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to approve this user’s payment?
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex justify-end space-x-2 mt-4">
         
                                    <Button
                                      className="bg-green-600 hover:bg-green-700 cursor-pointer"
                                      onClick={() => handlePaymentAction(request._id, "approve")}
                                    >
                                      {paymentPendingLoading2 ? "Approving..." : "Confirm"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                      
                              {/* Reject Button with Dialog */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="destructive" className="cursor-pointer w-full sm:w-auto">
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Reject Payment</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to reject this payment request? This will notify the user.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex justify-end space-x-2 mt-4">
          
                                    <Button
                                      variant="destructive"
                                      className="cursor-pointer"
                                      onClick={() => handlePaymentAction(request._id, "reject")}
                                    >
                                      {paymentPendingLoading2 ? "Rejecting..." : "Confirm"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Course Management Tab */}
          <TabsContent value="courses" className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  {/* Title Section */}
                  <div>
                    <h2 className="text-2xl font-bold">Course Management</h2>
                    <p className="text-muted-foreground">Manage your course</p>
                  </div>

                  {/* Add Course Button for small screens */}
                  <div className="md:hidden">
                    <AddCourseDialog
                      onCourseUpdated={() => {
                        setCoursePage(1);
                        setActiveTab("courses");
                        setOnCourseCreated((prev) => !prev);
                      }}
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="w-full md:w-48">
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger id="category" className="w-full cursor-pointer">
                        <SelectValue placeholder="Search by Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key={0} value={"all"} className="cursor-pointer">
                          All Courses
                        </SelectItem>
                        {categoryEnum.map((cat) => (
                          <SelectItem key={cat} value={cat} className="cursor-pointer">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Add Course Button for medium and larger screens */}
                  <div className="hidden md:block">
                    <AddCourseDialog
                      onCourseUpdated={() => {
                        setCoursePage(1);
                        setActiveTab("courses");
                        setOnCourseCreated((prev) => !prev);
                      }}
                    />
                  </div>
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

                                <EditCourse course={course} onCourseUpdated={() => {
                                  // Refresh course list after edit
                                  setCoursePage(1); // reset to first page
                                  setActiveTab("courses"); // ensure tab is 
                                  setOnCourseUpdated((prev) => !prev); // toggle to trigger useEffect
                                }} />
                                   <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="destructive" className="cursor-pointer">
                                      <Trash2 className="h-3 w-3" />
                                      Delete
                                    </Button>
                                  </DialogTrigger>

                                  <DialogContent className="sm:max-w-lg bg-popover text-popover-foreground shadow-xl rounded-lg z-[9999]">
                                    <DialogHeader>
                                      <DialogTitle>Delete Course</DialogTitle>
                                      <DialogDescription>
                                        Are you sure you want to delete this course? This action cannot be undone.
                                      </DialogDescription>
                                    </DialogHeader>

                                    <div className="flex justify-end space-x-2 mt-4">
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="cursor-pointer">
                                          Cancel
                                        </Button>
                                      </DialogTrigger>

                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteCourse(course._id)}
                                        disabled={isDeleting}
                                        className="cursor-pointer"
                                      >
                                        {isDeleting ? "Deleting..." : "Delete"}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage user accounts</CardDescription>
                    </div>

                    {/* 🔍 Search Input */}
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search users..."
                        className="pl-9 pr-4 py-2"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {userLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Array.isArray(users) && users.length > 0 ? (
                        users.map((user) => (
                          <div
                                key={user._id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-3"
                              >
                                {/* User info */}
                                <div className="flex flex-col">
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-muted-foreground break-all">
                                    User ID: {user._id}
                                  </p>
                                  <p className="text-sm text-muted-foreground break-all">
                                    {user.email}
                                  </p>

                                  {/* Mobile-only buttons (visible on small screens) */}
                                  <div className="flex items-center justify-between mt-3 sm:hidden">
                                    <Badge
                                      variant={
                                        user.subscriptionStatus === "Active"
                                          ? "default"
                                          : user.subscriptionStatus === "Trial"
                                          ? "secondary"
                                          : "outline"
                                      }
                                    >
                                      {user.subscriptionStatus}
                                    </Badge>

                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="cursor-pointer"
                                      onClick={() =>
                                        handleOpenDialog(user.subscriptionStatus, user._id)
                                      }
                                    >
                                      <Edit className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>
                                  </div>
                                </div>

                                {/* Desktop buttons (hidden on small screens) */}
                                <div className="hidden sm:flex items-center space-x-4">
                                  <Badge
                                    variant={
                                      user.subscriptionStatus === "Active"
                                        ? "default"
                                        : user.subscriptionStatus === "Trial"
                                        ? "secondary"
                                        : "outline"
                                    }
                                  >
                                    {user.subscriptionStatus}
                                  </Badge>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={() =>
                                      handleOpenDialog(user.subscriptionStatus, user._id)
                                    }
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                </div>
                              </div>

                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center">No users found.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Single Dialog for Editing Subscription */}
              {editingUserId && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogContent className="sm:max-w-md bg-popover text-popover-foreground shadow-xl rounded-lg">
                    <DialogHeader>
                      <DialogTitle>Edit Subscription Status</DialogTitle>
                      <DialogDescription>
                        Change the user's current subscription plan.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                      <Label htmlFor="status">Subscription Status</Label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger id="status" className="w-full cursor-pointer">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Trial" className="cursor-pointer">Trial</SelectItem>
                          <SelectItem value="Active" className="cursor-pointer">Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                      <Button
                        variant="default"
                        size="sm"
                        disabled={statusLoading}
                        onClick={() => handleSave(editingUserId)}
                      >
                        {statusLoading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

          </TabsContent>
        </Tabs>





        {/* Pagination for Courses */}
        {activeTab === "courses" && courses.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationPrevious
                className={coursePage === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                onClick={coursePage === 1 ? undefined : () => setCoursePage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </PaginationPrevious>
              <PaginationContent>
                  {currentPage} of {totalPages}
              </PaginationContent>

              <PaginationNext
                onClick={totalPages === currentPage ? undefined : () => setCoursePage((prev) => prev + 1)}
                className={totalPages === currentPage ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
              >
                Next
              </PaginationNext>
            </Pagination>
          </div>
        )}


         {/* Pagination for users */}
         {activeTab === "users" && Array.isArray(users) && users.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationPrevious
                className={userPage === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                onClick={userPage === 1 ? undefined : () => setUserPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </PaginationPrevious>
              <PaginationContent>
                  {userCurrentPage} of {userTotalPages}
              </PaginationContent>

              <PaginationNext
                onClick={userTotalPages === userCurrentPage ? undefined : () => setUserPage((prev) => prev + 1)}
                className={userTotalPages === userCurrentPage ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
              >
                Next
              </PaginationNext>
            </Pagination>
          </div>
        )}



      </div>
    </div>
  )
}
