import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Code2, Zap, ArrowRight, Terminal, CheckCircle2, LogOut, User, LayoutDashboard, ChevronDown } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Problemset", to: "/problems" },
  { label: "Contests", to: "/contests" },
  { label: "Leaderboard", to: "/leaderboard" },
];

function LandingPage() {
  const { firebaseUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Alias for compatibility
  const currentUser = firebaseUser;

  async function handleLogout() {
    try {
      await logout();
      setDropdownOpen(false);
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  }
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      {/* ================= Navbar ================= */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <Code2 className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Code<span className="text-indigo-400">Dour</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth section */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-slate-800"
                >
                  {currentUser.photoURL && (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      className="h-8 w-8 rounded-full border border-slate-700"
                    />
                  )}
                  <span className="text-sm font-medium text-slate-300">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown when clicking outside */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    
                    {/* Dropdown content */}
                    <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-slate-800 bg-slate-900 py-2 shadow-xl">
                      {/* Dashboard with nested options */}
                      <div className="border-b border-slate-800 pb-2">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        {/* Nested items under Dashboard */}
                        <div className="ml-8 space-y-1 border-l border-slate-800 pl-3">
                          <Link
                            to="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 py-1.5 text-xs text-slate-400 transition-colors hover:text-slate-200"
                          >
                            <User className="h-3.5 w-3.5" />
                            My Profile
                          </Link>
                          <Link
                            to="/my-submissions"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 py-1.5 text-xs text-slate-400 transition-colors hover:text-slate-200"
                          >
                            <Terminal className="h-3.5 w-3.5" />
                            My Submissions
                          </Link>
                        </div>
                      </div>

                      {/* Sign out */}
                      <div className="pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-slate-800 hover:text-red-300"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* ================= Hero ================= */}
      <section className="relative overflow-hidden">
        {/* soft background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          {/* Left: copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              <Zap className="h-3.5 w-3.5" />
        
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Transform Practice into{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Mastery
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-slate-400">
              Track your progress, compete with peers, and become a better programmer through challenging problems and real-time contests.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/problems"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-colors hover:bg-indigo-400"
              >
                Start solving
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contests"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800/50"
              >
                Browse contests
              </Link>
            </div>
          </div>

          {/* Right: code editor mockup */}
          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/40">
              {/* window bar */}
              <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <Terminal className="h-3.5 w-3.5" />
                  solution.cpp
                </span>
              </div>
              {/* code body */}
              <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
                <code className="font-mono">
                  <span className="text-pink-400">#include</span>{" "}
                  <span className="text-emerald-400">&lt;iostream&gt;</span>
                  {"\n"}
                  <span className="text-indigo-400">using namespace</span> std;
                  {"\n\n"}
                  <span className="text-indigo-400">int</span>{" "}
                  <span className="text-yellow-300">main</span>() {"{"}
                  {"\n"}
                  {"  "}
                  <span className="text-indigo-400">int</span> a, b;{"\n"}
                  {"  "}cin {">>"} a {">>"} b;{"\n"}
                  {"  "}cout {"<<"} a + b;{"\n"}
                  {"}"}
                </code>
              </pre>
              {/* verdict bar */}
              <div className="flex items-center gap-2 border-t border-slate-800 bg-slate-900 px-5 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">
                  Accepted
                </span>
                <span className="ml-auto text-xs text-slate-500">
                  12 ms · 3.4 MB
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}

export default LandingPage;
