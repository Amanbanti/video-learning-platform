"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "../components/ui/button"
import { ThemeToggle } from "../components/theme-toggle"
import { BookOpen, ArrowLeft, LogIn,Menu, LogOut } from "lucide-react"
import { getCurrentUser, logout } from "../lib/auth"
import Link from "next/link"
import toast from "react-hot-toast"



import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
  } from "../components/ui/menubar"


export const Header = () => {

    const [user, setUser] = useState(getCurrentUser())
    const router = useRouter()
    const pathname = usePathname()

  
    useEffect(() => {
      const handleStorageChange = () => {
        setUser(getCurrentUser())
      }
  
      window.addEventListener("storage", handleStorageChange)
      return () => window.removeEventListener("storage", handleStorageChange)
    }, [])
  

    useEffect(() => {
      if (!user) {
        // Guest: allow "/" and "/auth", else redirect to /auth
        if (pathname !== "/" && pathname !== "/auth") {
          router.push("/auth")
        }
      } else {
        // Logged-in user
        if (user.isAdmin === true && pathname === "/") {
          router.push("/admin") // block admin from landing page
        }
      }
    }, [user, pathname, router])
    
    
    const handleLogout = () => {
        try {
        logout()
        toast.success("Logged out successfully", { duration: 3000 })
        router.push("/")

        }catch {
            toast.error("Error logging out", { duration: 3000 })

        }
        
      }

  return (
    <div>
       <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">EduLearn</span>
            </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
          <ThemeToggle />
           
            {user ? (

                
                    <Menubar>
                    <MenubarMenu>
                    <MenubarTrigger className="cursor-pointer"><Menu/></MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem disabled><span className="text-sm text-muted-foreground">Welcome, {user.name}</span></MenubarItem>
                        <MenubarItem className="cursor-pointer" onClick={() => router.push("/")}>
                                Home
                        </MenubarItem>
                        {user.isAdmin ? (
                            <MenubarItem className="cursor-pointer" onClick={() => router.push("/admin")}>
                                Admin Dashboard
                            </MenubarItem>
                        ):(
                            <MenubarItem className="cursor-pointer" onClick={() => router.push("/dashboard")}>
                                Dashboard
                            </MenubarItem>
                        )}
                         {!user.isAdmin && (
                            <MenubarItem className="cursor-pointer" onClick={() => router.push("/courses")}>
                                My Courses
                            </MenubarItem>
                        )}
                        {!user.isAdmin && (
                            <MenubarItem className="cursor-pointer" onClick={() => router.push("/subscription")}>
                                Subscription
                            </MenubarItem>
                        )}
                        <MenubarSeparator />
                    
                        <MenubarItem className="cursor-pointer" variant="destructive" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </MenubarItem>
                    </MenubarContent>
                    </MenubarMenu>
                    </Menubar>
                 
                    
               
                ) : (
                <Button className="cursor-pointer" variant="default" onClick={() => router.push("/auth")}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                 </Button>
                )
                
            }
          
          </div>
        </div>
      </header>
      
    </div>
  )
}

export default Header
