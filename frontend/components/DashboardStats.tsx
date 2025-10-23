"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Users, Video, CreditCard } from "lucide-react"
import { getUserPaymentStats } from "../lib/auth"
import {getCourseStats} from "../lib/course"
import { useEffect, useState } from "react"

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingPayments: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userStats = await getUserPaymentStats()
        const courseStat = await getCourseStats()
        // Here you can fetch courses count as well if needed
        setStats({
          totalUsers: userStats.totalUsers || 0,
          pendingPayments: userStats.pendingPayments || 0,
          totalRevenue: userStats.totalRevenue || 0,
          totalCourses: courseStat.totalCourses || 0, // optional if backend provides
        })
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      {/* Total Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>

      {/* Total Courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          <Video className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCourses}</div>
          <p className="text-xs text-muted-foreground">Across all categories</p>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingPayments}</div>
          <p className="text-xs text-muted-foreground">Awaiting approval</p>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRevenue} ETB</div>
          <p className="text-xs text-muted-foreground">From approved payments</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardStats
