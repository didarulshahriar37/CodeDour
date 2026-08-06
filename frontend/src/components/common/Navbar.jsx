import { Link, useLocation, useNavigate } from "react-router-dom";
import { Code2, ChevronDown, User, LogOut, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
 
const NAV_LINKS = [
  { label: "Problems", to: "/problems" },
];
 
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { firebaseUser, profile, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin = profile?.role === "admin";
  const isActive = (to) => location.pathname.startsWith(to);
  
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await logout();
      setDropdownOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  }

  const displayName = firebaseUser?.displayName || firebaseUser?.email?.split("@")[0] || "User";
  const photoURL = firebaseUser?.photoURL;
 
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <Code2 className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
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

          {/* Admin Link - ONLY shown for Admin */}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 transition hover:bg-amber-500/20 ${
                isActive("/admin") ? "ring-2 ring-amber-500/50" : ""
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              Admin Dashboard
            </Link>
          )}
        </div>
 
        {/* Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-slate-800"
              >
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName}
                    className="h-8 w-8 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-300">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-sm font-medium text-slate-200">
                  {displayName}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-800 bg-slate-900 py-2 shadow-xl">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-amber-400 transition-colors hover:bg-slate-800"
                    >
                      <Shield className="h-4 w-4 text-amber-400" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-slate-800 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
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