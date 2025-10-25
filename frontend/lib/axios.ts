import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"; // fallback for local dev

export const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true, // keep this if you use cookies
});


// // Add a response interceptor to handle expired tokens
// axiosInstance.interceptors.response.use(
//   (response) => response, // if the response is OK, just return it
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Token expired or unauthorized
//       localStorage.removeItem("currentUser") // remove user from localStorage
//       window.location.href = "/auth" // redirect to login page
//     }
//     return Promise.reject(error)
//   }
// )
