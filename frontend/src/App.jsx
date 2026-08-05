import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
// Friend's new pages
import Problems from "./pages/Problems";
import ProblemDetail from "./pages/ProblemDetail";
import Contests from "./pages/Contests";
import ContestDetail from "./pages/ContestDetail";
import Submissions from "./pages/Submissions";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Your tiran pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-submissions" element={<Submissions />} />
          
          {/* Friend's integrated pages */}
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:id" element={<ProblemDetail />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/contests/:id" element={<ContestDetail />} />
          <Route path="/submissions" element={<Submissions />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
