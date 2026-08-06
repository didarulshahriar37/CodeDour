import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBv5BwLI9rWfgi2KowKXn9HoR2dkfYtvgE",
  authDomain: "codedour.firebaseapp.com",
  projectId: "codedour",
  storageBucket: "codedour.firebasestorage.app",
  messagingSenderId: "887037462911",
  appId: "1:887037462911:web:125c2796cbe063bd66b24a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
