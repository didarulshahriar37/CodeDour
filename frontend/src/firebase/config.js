// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// TODO: Replace these placeholder values with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBv5BwLI9rWfgi2KowKXn9HoR2dkfYtvgE",
  authDomain: "codedour.firebaseapp.com",
  projectId: "codedour",
  storageBucket: "codedour.firebasestorage.app",
  messagingSenderId: "887037462911",
  appId: "1:887037462911:web:125c2796cbe063bd66b24a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
