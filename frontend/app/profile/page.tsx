"use client"

import React, { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Header } from "../../components/Header"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { getCurrentUser,updateUserProfile,updatePassword } from "../../lib/auth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"

const ProfilePage = () => {
  const [user, setUser] = useState(getCurrentUser())
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "") // read-only
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)


  // Dialog control
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)

  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    if (user.isAdmin) {
      router.push("/admin")
      return
    }
  }, [user, router])



  const handleProfileUpdate = async () => {
    try {
      setIsLoadingProfile(true)
      const updatedUser = { ...user!, name } // merge updated name
      await updateUserProfile(user!._id, name)
      
      // Update localStorage
      const currentSession = JSON.parse(localStorage.getItem("currentUser") || "{}")
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ ...currentSession, user: updatedUser })
      )
      setUser(updatedUser)
      toast.success("Profile updated successfully.")
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to update profile."
      )
    } finally {
      setIsLoadingProfile(false)
      setIsProfileDialogOpen(false)
    }
  }
  




  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    try {
      setIsLoadingPassword(true)
      await updatePassword(user!._id, currentPassword, newPassword);
      toast.success("Password updated successfully.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to update password."
      )
    } finally {
      setIsLoadingPassword(false)
      setIsPasswordDialogOpen(false)
    }
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen flex justify-center items-center bg-gray-50 p-6">
        <div className="w-full max-w-2xl grid md:grid-cols-2 gap-6">
          {/* Profile Update */}
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Profile Info</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setIsProfileDialogOpen(true)
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} readOnly />
                </div>

                <Button type="submit" className="cursor-pointer w-full" disabled={isLoadingProfile}>
                  {isLoadingProfile ? "Saving..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Update */}
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Change Password</CardTitle>
              <CardDescription>Keep your account secure by updating your password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setIsPasswordDialogOpen(true)
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button className="cursor-pointer w-full" type="submit" disabled={isLoadingPassword}>
                  {isLoadingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Confirmation Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Profile Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to update your profile information?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button className="cursor-pointer" variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="cursor-pointer" onClick={handleProfileUpdate} disabled={isLoadingProfile}>
              {isLoadingProfile ? "Saving..." : "Yes, Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Confirmation Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Password Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to change your password?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button className="cursor-pointer" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="cursor-pointer" onClick={handlePasswordUpdate} disabled={isLoadingPassword}>
              {isLoadingPassword ? "Updating..." : "Yes, Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProfilePage
