import axios from "axios";
import { auth } from "../firebase/config";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getCurrentUser = () => {
  return new Promise((resolve) => {
    if (auth.currentUser !== null) {
      return resolve(auth.currentUser);
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

api.interceptors.request.use(async (config) => {
  const user = await getCurrentUser();

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong. Please try again.";

    return Promise.reject({ status, message, details: error.response?.data });
  }
);

export default api;