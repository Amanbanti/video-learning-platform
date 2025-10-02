import {axiosInstance} from "./axios"

export interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
  subscriptionStatus: "trial" | "pending" | "active" | "none"
  password: string
  trialVideosWatched: number
  maxTrialVideos: number
  paymentReceipt?: string
}

export interface Course {
  id: string
  title: string
  description: string
  category: "natural" | "social"
  thumbnail: string
  chapters: Chapter[]
  isPremium: boolean
}

export interface Chapter {
  id: string
  title: string
  description: string
  videoUrl: string
  duration: string
  isPremium: boolean
}

export interface PaymentRequest {
  id: string
  userId: string
  amount: number
  paymentMethod: "telebirr" | "cbe"
  receiptImage: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date
}

// Mock data
export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Applied Mathematics 1",
    description: "Comprehensive course covering calculus, linear algebra, and differential equations",
    category: "natural",
    thumbnail: "/mathematics-textbook.png",
    isPremium: true,
    chapters: [
      {
        id: "1-1",
        title: "Introduction to Calculus",
        description: "Basic concepts of limits and derivatives",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        duration: "45:30",
        isPremium: false,
      },
      {
        id: "1-2",
        title: "Advanced Derivatives",
        description: "Chain rule, product rule, and applications",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        duration: "52:15",
        isPremium: true,
      },
    ],
  },
  {
    id: "2",
    title: "Physics Fundamentals",
    description: "Core principles of mechanics, thermodynamics, and electromagnetism",
    category: "natural",
    thumbnail: "/physics-laboratory.png",
    isPremium: true,
    chapters: [
      {
        id: "2-1",
        title: "Newton's Laws",
        description: "Understanding motion and forces",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        duration: "38:45",
        isPremium: false,
      },
    ],
  },
  {
    id: "3",
    title: "World History",
    description: "From ancient civilizations to modern times",
    category: "social",
    thumbnail: "/ancient-history-books.jpg",
    isPremium: true,
    chapters: [
      {
        id: "3-1",
        title: "Ancient Civilizations",
        description: "Egypt, Mesopotamia, and the Indus Valley",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        duration: "41:20",
        isPremium: false,
      },
    ],
  },
  {
    id: "4",
    title: "Psychology Basics",
    description: "Introduction to human behavior and mental processes",
    category: "social",
    thumbnail: "/psychology-brain-illustration.jpg",
    isPremium: true,
    chapters: [
      {
        id: "4-1",
        title: "Cognitive Psychology",
        description: "How we think, learn, and remember",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        duration: "35:10",
        isPremium: false,
      },
    ],
  },
]

// Mock user data
export const mockUser: User = {
  id: "1",
  email: "student@example.com",
  name: "John Doe",
  password: "student123",
  isAdmin: false,
  subscriptionStatus: "trial",
  trialVideosWatched: 2,
  maxTrialVideos: 3,
}

export const mockAdmin: User = {
  id: "admin",
  email: "admin@edulearn.com",
  name: "Admin User",
  password: "admin123",
  isAdmin: true,
  subscriptionStatus: "active",
  trialVideosWatched: 0,
  maxTrialVideos: 0,
}

// Auth functions
export function getCurrentUser(): User | null {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("currentUser")
    return userData ? JSON.parse(userData) : null
  }
  return null
}

export function setCurrentUser(user: User | null) {
  if (typeof window !== "undefined") {
    if (user) {
      console.log("Setting current user: on local storage")
      localStorage.setItem("currentUser", JSON.stringify(user))
    } else {
      localStorage.removeItem("currentUser")
    }
  }
}


export async function login(email: string, password: string): Promise<User | null> {
  const res = await axiosInstance.post(
    "/users/login",
    { email, password },
    { withCredentials: true } // needed if JWT cookie is set
  );

  
  setCurrentUser(res.data.user);
  return res.data;
}





// Step 1–3: register and send OTP
export async function register(
  email: string,
  password: string,
  name: string,
  freshOrRemedial: string,
  naturalOrSocial: string
) {
  const res = await axiosInstance.post("/users/register", {
    email,
    password,
    name,
    freshOrRemedial,
    naturalOrSocial,
  });
 
  return res.data;
}



// Step 4: verify OTP
export async function verifyOtp(email: string, otp: string) {
  const res = await axiosInstance.post("/users/verify-otp", {
    email,
    otp,
  });
  setCurrentUser(res.data.user);
  return res.data;
}




export async function logout() {
  setCurrentUser(null)
  const res = await axiosInstance.post("/users/logout")
  return res.data

}
