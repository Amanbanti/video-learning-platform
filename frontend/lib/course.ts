import {axiosInstance} from "./axios"


// Mock data
export const mockCourses: Course[] = [
  {
    _id: "1",
    title: "Applied Mathematics 1",
    description: "Comprehensive course covering calculus, linear algebra, and differential equations",
    instructor: "Dr. John Smith",
    coverImageUrl: "/mathematics-textbook.png",
    category: "Natural-FreshMan",
    chapters: [
      {
        _id: "1-1",
        title: "Introduction to Calculus",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        duration:"200",
        description:"calculus for uni  student"
      },
      {
        _id: "1-2",
        title: "Advanced Derivatives",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        duration:"200",
        description:"calculus for uni  student"
      },
    ],
  },
  {
    _id: "2",
    title: "Physics Fundamentals",
    description: "Core principles of mechanics, thermodynamics, and electromagnetism",
    instructor: "Prof. Alice Brown",
    coverImageUrl: "/physics-laboratory.png",
    category: "Natural-Remedial",
    chapters: [
      {
        _id: "2-1",
        title: "Newton's Laws",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        duration:"200",
        description:"calculus for uni  student"
      },
    ],
  },
  {
    _id: "3",
    title: "World History",
    description: "From ancient civilizations to modern times",
    instructor: "Dr. Emma Davis",
    coverImageUrl: "/ancient-history-books.jpg",
    category: "Social-FreshMan",
    chapters: [
      {
        _id: "3-1",
        title: "Ancient Civilizations",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        duration:"200",
        description:"calculus for uni  student"
      },
    ],
  },
  {
    _id: "4",
    title: "Psychology Basics",
    description: "Introduction to human behavior and mental processes",
    instructor: "Prof. Michael Lee",
    coverImageUrl: "/psychology-brain-illustration.jpg",
    category: "Social-Remedial",
    chapters: [
      {
        _id: "4-1",
        title: "Cognitive Psychology",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        duration:"200",
        description:"calculus for uni  student"
      },
    ],
  },
]

export interface PaymentRequest {
    id: string
    userId: string
    amount: number
    paymentMethod: "telebirr" | "cbe"
    receiptImage: string
    status: "pending" | "approved" | "rejected"
    createdAt: Date
  }


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

export interface ChapterInput {
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
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

// Function to create a new course
export async function createCourse(
  title: string,
  description: string,
  instructor: string,
  category: CategoryEnum,
  coverImage: File | null
): Promise<Course> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("instructor", instructor);
  formData.append("category", category);
  if (coverImage) formData.append("coverImage", coverImage);

  const res = await axiosInstance.post("/courses", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}


export async function updateCourse(
  courseId: string,
  title: string,
  description: string,
  instructor: string,
  category: CategoryEnum,
  coverImage: File | null
): Promise<Course> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("instructor", instructor);
  formData.append("category", category);
  if (coverImage) formData.append("coverImage", coverImage);
  const res = await axiosInstance.put(`/courses/${courseId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function fetchCourses(
    page: number = 1,
    limit: number = 10,
    category?: string
  ): Promise<Course[]> {
    const res = await axiosInstance.get("/courses", {
      params: {
        page,
        limit,
        category: category || undefined,
      },
    });
    return res.data.courses; // assuming backend returns { courses: [] }
  }
  

  export async function fetchCourseById(courseId: string): Promise<Course> {
    const res = await axiosInstance.get(`/courses/${courseId}`);
    return res.data;
  }


  export async function deleteCourse(courseId: string): Promise<void> {
    await axiosInstance.delete(`/courses/${courseId}`);
    return;
  }


  export async function createChapter(courseId: string, chapter: ChapterInput): Promise<Chapter> {
    try {
      const res = await axiosInstance.post(`/courses/${courseId}/chapters`, chapter);
      return res.data; // the created chapter
    } catch (error: any) {
      console.error("Error creating chapter:", error);
      throw error;
    }
  }