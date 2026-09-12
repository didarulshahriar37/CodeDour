import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Code2, Loader2, Mail } from "lucide-react";
import authService from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    document.title = "Reset Password | CodeDour";
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await authService.resetPassword(email.trim());
      setMessage({
        type: "success",
        text: "If an account uses this email, a password-reset link has been sent.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Couldn't send the reset email. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <Code2 className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Code<span className="text-indigo-400">Dour</span></span>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white">
            <ArrowLeft size={16} /> Back to sign in
          </Link>

          <h1 className="mt-6 text-xl font-bold">Reset your password</h1>
          <p className="mt-1 text-sm text-slate-400">Enter your account email and we’ll send you a reset link.</p>

          {message && (
            <div className={`mt-5 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${message.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-400">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input id="email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500" />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold transition hover:bg-indigo-400 disabled:opacity-50">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Send reset link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
