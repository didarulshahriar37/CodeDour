import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";
 
const AuthContext = createContext(null);
 
export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  // Subscribe once on mount; Firebase persists the session across reloads.
  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (user) => {
      setFirebaseUser(user);
 
      if (user) {
        try {
          const data = await authService.getProfile();
          setProfile(data);
        } catch (err) {
          // Firebase account exists but no matching Postgres row yet
          // (e.g. register() partially failed) — surface it, don't crash.
          setError(err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
 
      setLoading(false);
    });
 
    return unsubscribe;
  }, []);
 
  async function login(email, password) {
    setError(null);
    try {
      await authService.login({ email, password });
    } catch (err) {
      setError(err);
      throw err;
    }
  }
 
  async function loginWithGoogle() {
    setError(null);
    try {
      await authService.loginWithGoogle();
    } catch (err) {
      setError(err);
      throw err;
    }
  }
 
  async function register(email, password, username) {
    setError(null);
    try {
      const { profile: newProfile } = await authService.register({
        email,
        password,
        username,
      });
      setProfile(newProfile);
    } catch (err) {
      setError(err);
      throw err;
    }
  }
 
  async function logout() {
    await authService.logout();
    setProfile(null);
  }
 
  async function refreshProfile() {
    const data = await authService.getProfile();
    setProfile(data);
    return data;
  }
 
  const value = {
    firebaseUser,
    profile,
    isAuthenticated: !!firebaseUser,
    loading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshProfile,
  };
 
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
 
// Usage: const { profile, isAuthenticated, login, logout } = useAuth();
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}