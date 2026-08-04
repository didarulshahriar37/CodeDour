import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase/config";
import api from "./api";
 
/**
 * Register a new user: creates the Firebase account, then creates the
 * matching profile row in Postgres (users table) via the backend.
 * If the backend call fails, the Firebase user still exists — caller
 * should surface that so the user can retry profile creation/login.
 */
async function register({ email, password, username }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
 
  const { data } = await api.post("/auth/register", {
    firebaseUid: credential.user.uid,
    email,
    username,
  });
 
  return { firebaseUser: credential.user, profile: data };
}
 
async function login({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
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
 
/**
 * Subscribe to Firebase auth state changes.
 * Use inside AuthContext: const unsubscribe = onAuthChange(setUser); return unsubscribe;
 */
function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
 
function getCurrentFirebaseUser() {
  return auth.currentUser;
}
 
// ---- Backend-backed profile data (user.routes.js / user.controller.js) ----
 
async function getProfile() {
  const { data } = await api.get("/users/me");
  return data;
}
 
async function updateProfile(updates) {
  const { data } = await api.put("/users/me", updates);
  return data;
}
 
async function getUserByUsername(username) {
  const { data } = await api.get(`/users/${username}`);
  return data;
}
 
// Backed by database/functions/get_user_statistics.sql
async function getUserStats(username) {
  const { data } = await api.get(`/users/${username}/stats`);
  return data;
}
 
async function getUserAchievements(username) {
  const { data } = await api.get(`/users/${username}/achievements`);
  return data;
}
 
const authService = {
  register,
  login,
  logout,
  resetPassword,
  changePassword,
  onAuthChange,
  getCurrentFirebaseUser,
  getProfile,
  updateProfile,
  getUserByUsername,
  getUserStats,
  getUserAchievements,
};
 
export default authService;
export {
  register,
  login,
  logout,
  resetPassword,
  changePassword,
  onAuthChange,
  getCurrentFirebaseUser,
  getProfile,
  updateProfile,
  getUserByUsername,
  getUserStats,
  getUserAchievements,
};