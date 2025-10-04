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

export const categoryEnum = [
  "Natural-FreshMan",
  "Natural-Remedial",
  "Social-FreshMan",
  "Social-Remedial",
  "Common",
] as const; // 'as const' makes it a readonly tuple

export interface Chapter {
  id: string;
  title: string;
  videoUrl: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  coverImage: string;
  category: typeof categoryEnum[number]; // picks one of the tuple elements
  chapters: Chapter[];
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
    instructor: "Dr. John Smith",
    coverImage: "/mathematics-textbook.png",
    category: "Natural-FreshMan",
    chapters: [
      {
        id: "1-1",
        title: "Introduction to Calculus",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      },
      {
        id: "1-2",
        title: "Advanced Derivatives",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      },
    ],
  },
  {
    id: "2",
    title: "Physics Fundamentals",
    description: "Core principles of mechanics, thermodynamics, and electromagnetism",
    instructor: "Prof. Alice Brown",
    coverImage: "/physics-laboratory.png",
    category: "Natural-Remedial",
    chapters: [
      {
        id: "2-1",
        title: "Newton's Laws",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      },
    ],
  },
  {
    id: "3",
    title: "World History",
    description: "From ancient civilizations to modern times",
    instructor: "Dr. Emma Davis",
    coverImage: "/ancient-history-books.jpg",
    category: "Social-FreshMan",
    chapters: [
      {
        id: "3-1",
        title: "Ancient Civilizations",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      },
    ],
  },
  {
    id: "4",
    title: "Psychology Basics",
    description: "Introduction to human behavior and mental processes",
    instructor: "Prof. Michael Lee",
    coverImage: "/psychology-brain-illustration.jpg",
    category: "Social-Remedial",
    chapters: [
      {
        id: "4-1",
        title: "Cognitive Psychology",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      },
    ],
  },
]



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
