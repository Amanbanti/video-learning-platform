"use client"


import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Users, Video, CreditCard} from "lucide-react"



const DashboardStats = () => {

    //   const pendingPayments = paymentRequests.filter((req) => req.status === "pending")
    //   const totalUsers = 156 // Mock data
    //   const totalRevenue = paymentRequests
    //     .filter((req) => req.status === "approved")
    //     .reduce((sum, req) => sum + req.amount, 0)

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{100}</div>
        <p className="text-xs text-muted-foreground">+12% from last month</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
        <Video className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{12}</div>
        <p className="text-xs text-muted-foreground">Across all categories</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{3}</div>
        <p className="text-xs text-muted-foreground">Awaiting approval</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{10000} ETB</div>
        <p className="text-xs text-muted-foreground">From approved payments</p>
      </CardContent>
    </Card>
  </div>
  )
}

export default DashboardStats
