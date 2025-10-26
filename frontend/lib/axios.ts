import axios from "axios"

const resolveBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
  if (typeof window !== "undefined") return window.location.origin
  return "http://localhost:5001"
}

const BASE_URL = resolveBaseUrl().replace(/\/$/, "")

export const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
})
