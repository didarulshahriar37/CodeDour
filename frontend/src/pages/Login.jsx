import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Code2, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleIcon from "../components/common/GoogleIcon";
 
export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  useEffect(() => {
    document.title = "Sign In | CodeDour";
  }, []);
 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState(null);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Couldn't sign in. Check your email and password.");
    } finally {
      setSubmitting(false);
    }
  };
 
  const handleGoogle = async () => {
    setError(null);
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setGoogleSubmitting(false);
    }
  };
 
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <Code2 className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Code<span className="text-indigo-400">Dour</span>
            </span>
          </Link>
        </div>
 
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <h1 className="text-xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to keep track of your progress.
          </p>
 
          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}
 
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>
 
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-400">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>
 
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold hover:bg-indigo-400 transition disabled:opacity-50"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>
          </form>
 
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs text-slate-500">OR</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
 
          <button
            onClick={handleGoogle}
            disabled={googleSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-2.5 text-sm font-medium hover:bg-slate-800/50 transition disabled:opacity-50"
          >
            {googleSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <GoogleIcon size={16} />
            )}
            Continue with Google
          </button>
 
          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}