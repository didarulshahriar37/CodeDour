import { BrowserRouter, Routes, Route } from "react-router-dom";
 
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./layouts/Layout";
import LandingPage from "./pages/Home";
import Problems from "./pages/Problems";
import ProblemDetail from "./pages/ProblemDetail";
import Contests from "./pages/Contests";
import ContestDetail from "./pages/ContestDetail";
import Submissions from "./pages/Submissions";
import Login from "./pages/Login";
import Register from "./pages/Register";
 
// TODO: build these, then swap in for the placeholders below
// import Profile from "./pages/Profile";
// import Leaderboard from "./pages/Leaderboard";
 
function ComingSoon({ label }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-950 text-slate-500">
      {label} — coming soon
    </div>
  );
}
 
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes that share the main Navbar */}
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/contests" element={<Contests />} />
 
            {/* TODO: replace with real pages as they're built */}
            <Route
              path="/leaderboard"
              element={<ComingSoon label="Leaderboard" />}
            />
            <Route path="/submissions" element={<Submissions />} />
 
            {/* Signed-in only */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ComingSoon label="Profile" />} />
            </Route>
          </Route>
 
          {/* Routes that render full-screen without the main Navbar */}
          <Route path="/problems/:id" element={<ProblemDetail />} />
          <Route path="/contests/:id" element={<ContestDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}