export interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
  subscriptionStatus: "trial" | "pending" | "active" | "expired"
  trialVideosWatched: number
  maxTrialVideos: number
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
  isAdmin: false,
  subscriptionStatus: "trial",
  trialVideosWatched: 2,
  maxTrialVideos: 3,
}

export const mockAdmin: User = {
  id: "admin",
  email: "admin@edulearn.com",
  name: "Admin User",
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
      localStorage.setItem("currentUser", JSON.stringify(user))
    } else {
      localStorage.removeItem("currentUser")
    }
  }
}

export function login(email: string, password: string): User | null {
  // Mock login logic
  if (email === "admin@edulearn.com" && password === "admin123") {
    setCurrentUser(mockAdmin)
    return mockAdmin
  } else if (email === "student@example.com" && password === "student123") {
    setCurrentUser(mockUser)
    return mockUser
  }
  return null
}

export function register(email: string, password: string, name: string): User {
  const newUser: User = {
    id: Date.now().toString(),
    email,
    name,
    isAdmin: false,
    subscriptionStatus: "trial",
    trialVideosWatched: 0,
    maxTrialVideos: 3,
  }
  setCurrentUser(newUser)
  return newUser
}

export function logout() {
  setCurrentUser(null)
}
