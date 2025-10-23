import {axiosInstance} from "./axios"

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

export interface UserResponse {
  users: User[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}




// Auth functions

export function setCurrentUser(user: User | null) {
  if (typeof window === "undefined") return;

  if (user) {
    console.log("Setting current user in local storage");

    const data = {
      user,
      timestamp: new Date().getTime(), // current time in ms
    };

    localStorage.setItem("currentUser", JSON.stringify(data));
  } else {
    localStorage.removeItem("currentUser");
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;

  const userData = localStorage.getItem("currentUser");
  if (!userData) return null;

  try {
    const parsed = JSON.parse(userData) as { user: User; timestamp: number };
    const now = new Date().getTime();

    // 1 day = 24 * 60 * 60 * 1000 ms
    if (now - parsed.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem("currentUser"); // expired
      return null;
    }

    return parsed.user;
  } catch {
    localStorage.removeItem("currentUser");
    return null;
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


export async function getAllUsers(searchQuery: string, limit: number, userPage: number): Promise<UserResponse> {
  const res = await axiosInstance.get("/users", {
    params: { searchQuery, limit, userPage },
    withCredentials: true,
  })
  return res.data
}

export async function changeSubscriptionStatus(userId: string, status: string): Promise<User> {
  const res = await axiosInstance.put(`/users/${userId}/subscription`, { status }, { withCredentials: true })
  return res.data
}


export async function updateTrialVideosWatched(userId: string): Promise<User> {
  const res = await axiosInstance.patch(`/users/${userId}/trial-video`, {}, { withCredentials: true })
  return res.data
}

export async function getUserById(userId: string): Promise<User> {
  const res = await axiosInstance.get(`/users/${userId}`, { withCredentials: true })
  return res.data
}




export async function paymentSubmission(
  userId: string,
  paymentReceipt: File,
  paymentMethod: string,
  paymentAmount: number,
  payerPhoneNumber: string
): Promise<User> {
  const formData = new FormData()
  formData.append("paymentReceipt", paymentReceipt)
  formData.append("paymentMethod", paymentMethod)
  formData.append("paymentAmount", paymentAmount.toString())
  formData.append("payerPhoneNumber", payerPhoneNumber)

  const res = await axiosInstance.put(`/users/${userId}/payment-receipt`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  })

  return res.data
}


export async function handleEmailSubmit(email: string): Promise<void> {
  const res = await axiosInstance.post("/users/send-otp", { email })
  return res.data
}

export async function handleOtpSubmit(email: string, otp: string): Promise<void> {
  const res = await axiosInstance.post("/users/verify-otp-reset", { email, otp })
  return res.data
}

export async function handlePasswordReset(email: string, newPassword: string): Promise<void> {
  const res = await axiosInstance.post("/users/reset-password", { email, newPassword })
  return res.data
}


export async function updateUserProfile(
  userId: string,
  name: string
): Promise<User> {
  const res = await axiosInstance.put(
    `/users/${userId}/profile`,
    { name }, 
    { withCredentials: true }
  )
  return res.data
} 


export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const res = await axiosInstance.put(
    `/users/${userId}/password`,
    { currentPassword, newPassword },
    { withCredentials: true }
  )
  return res.data
}


export const fetchPendingUserPayments = async (): Promise<User[]> => {
  const res = await axiosInstance.get("/users/payments/pending", { withCredentials: true })
  return res.data
}

export async function updateUserSubscription(
  userId: string,
  data: { subscriptionStatus: "Trial" | "Pending" | "Active" }
) {
  const res = await axiosInstance.put(`/users/${userId}/payment-subscription`, data);
  return res.data;
}


export const getUserPaymentStats = async () => {
  const res = await axiosInstance.get("/users/dashboard/users-payments", { withCredentials: true })
  return res.data
}



