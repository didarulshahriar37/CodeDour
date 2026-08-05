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
 
/**
 * Register a new user: creates the Firebase account, then creates the
 * matching profile row in Postgres (users table) via the backend.
 * If the backend call fails, the Firebase user still exists — caller
 * should surface that so the user can retry profile creation/login.
 *
 * NOTE: /api/auth is entirely commented out in app.js right now, so this
 * POST will 404 until your friend uncomments that line and the route file
 * is wired up.
 */
async function register({ email, password, username, fullName }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update Firebase profile with display name
  if (fullName && credential.user) {
    await updateFirebaseProfile(credential.user, {
      displayName: fullName
    });
  }
 
  // Sync user to backend database
  try {
    const { data } = await api.post("/auth/sync");
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
 
/**
 * Google sign-in. First-time Google users won't have a Postgres profile row
 * yet — same /api/auth dependency as register() above, so profile creation
 * for brand-new Google users will also 404 until that route is live.
 */
async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
 
  try {
    await api.post("/auth/sync", {
      firebaseUid: credential.user.uid,
      email: credential.user.email,
      username: credential.user.displayName,
      provider: "google",
    });
  } catch {
    // If sync fails, user can still use Firebase auth
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
//
// NOTE: as of now, /api/users only exposes GET /:id, /:id/stats, /:id/submissions
// (routes for GET /me and PUT /me exist in the file but are commented out,
// waiting on verifyToken/authMiddleware). getProfile()/updateProfile() below
// call an endpoint that doesn't exist yet — swap the TODO back in once your
// friend uncomments those two lines in user.routes.js.
 
// TODO: not live yet — backend's GET /users/me is commented out
async function getProfile() {
  const { data } = await api.get("/users/profile");
  return data.user; // Backend returns { user: {...} }
}
 
// TODO: not live yet — no PUT route exists on /api/users at all yet
async function updateProfile(updates) {
  const { data } = await api.put("/users/profile", updates);
  return data;
}
 
// Live now: GET /api/users/:id
async function getUserById(id) {
  const { data } = await api.get(`/users/${id}`);
  return data.user; // Backend returns { user: {...} }
}
 
// Live now: GET /api/users/:id/stats — backed by get_user_statistics.sql
async function getUserStats(id) {
  const { data } = await api.get(`/users/${id}/stats`);
  return data.stats; // Backend returns { stats: {...} }
}
 
// Live now: GET /api/users/:id/submissions
async function getUserSubmissions(id) {
  const { data } = await api.get(`/users/${id}/submissions`);
  return data.submissions; // Backend returns { submissions: [...] }
}
 
// TODO: not live yet — lives on /api/achievements, which is still commented
// out in app.js (achievement.routes.js has GET /achievements/:id)
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