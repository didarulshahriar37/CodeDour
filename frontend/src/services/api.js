import axios from "axios";
import { auth } from "../firebase/config";
 
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
 
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
 
// Attach the current Firebase ID token to every request, if signed in.
// authMiddleware.js on the backend verifies this with the Firebase Admin SDK.
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
 
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
 
  return config;
});
 
// Normalize errors so callers always get { status, message, details }
// instead of having to dig through error.response themselves.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong. Please try again.";
 
    if (status === 401) {
      // Token expired/invalid/missing — bounce to sign in.
      // TODO: wire this to AuthContext instead of a hard redirect once it exists,
      // so we can clear in-memory user state too.
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
 
    return Promise.reject({ status, message, details: error.response?.data });
  }
);
 
export default api;
 