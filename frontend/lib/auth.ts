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
