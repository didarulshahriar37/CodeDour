import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updatePassword,
  updateProfile as updateFirebaseProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase/config";
import api from "./api";
 
const googleProvider = new GoogleAuthProvider();
 
async function register({ email, password, fullName }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  
  if (fullName && credential.user) {
    await updateFirebaseProfile(credential.user, {
      displayName: fullName
    });
    await credential.user.getIdToken(true);
  }

  try {
    const { data } = await api.post("/auth/sync", { fullName });
    return { firebaseUser: credential.user, profile: data.user };
  } catch (error) {
    console.error("Failed to sync user to backend:", error);
    return { firebaseUser: credential.user, profile: null };
  }
}
 
async function login({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}
 
async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
 
  try {
    await api.post("/auth/sync", {
      firebaseUid: credential.user.uid,
      email: credential.user.email,
      username: credential.user.displayName,
      provider: "google",
    });
  } catch (error) {
    await firebaseSignOut(auth);
    throw error;
  }
 
  return credential.user;
}
 
async function logout() {
  await firebaseSignOut(auth);
}
 
async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}
 
async function changePassword(newPassword) {
  if (!auth.currentUser) throw new Error("Not signed in.");
  await updatePassword(auth.currentUser, newPassword);
}
 
function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
 
function getCurrentFirebaseUser() {
  return auth.currentUser;
}
 
async function getProfile() {
  const { data } = await api.get("/users/profile");
  return data.user;
}
 
async function updateProfile(updates) {
  const { data } = await api.put("/users/profile", updates);
  return data;
}
 
async function getUserById(id) {
  const { data } = await api.get(`/users/${id}`);
  return data.user;
}
 
async function getUserStats(id) {
  const { data } = await api.get(`/users/${id}/stats`);
  return data.stats;
}
 
async function getUserSubmissions(id) {
  const { data } = await api.get(`/users/${id}/submissions`);
  return data.submissions;
}
 
async function getUserAchievements(id) {
  const { data } = await api.get(`/achievements/${id}`);
  return data;
}
 
const authService = {
  register,
  login,
  loginWithGoogle,
  logout,
  resetPassword,
  changePassword,
  onAuthChange,
  getCurrentFirebaseUser,
  getProfile,
  updateProfile,
  getUserById,
  getUserStats,
  getUserSubmissions,
  getUserAchievements,
};
 
export default authService;
export {
  register,
  login,
  loginWithGoogle,
  logout,
  resetPassword,
  changePassword,
  onAuthChange,
  getCurrentFirebaseUser,
  getProfile,
  updateProfile,
  getUserById,
  getUserStats,
  getUserSubmissions,
  getUserAchievements,
};
