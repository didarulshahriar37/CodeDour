import { Link, useLocation } from "react-router-dom";
import { Code2 } from "lucide-react";
 
const NAV_LINKS = [
  { label: "Problems", to: "/problems" },
  { label: "Contests", to: "/contests" },
  { label: "Leaderboard", to: "/leaderboard" },
];
 
// TODO: swap `loggedIn` for real auth state from context/AuthContext.jsx (Firebase)
const loggedIn = false;
 
export default function Navbar() {
  const location = useLocation();
 
  const isActive = (to) => location.pathname.startsWith(to);
 
  return (
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
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
 
        {/* Auth */}
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <Link
              to="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-200 hover:bg-slate-700"
            >
              A
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}