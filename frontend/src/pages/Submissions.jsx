import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Filter,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertTriangle,
  Ban,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Check,
} from "lucide-react";
import submissionService from "../services/submissionService";
 
const PAGE_SIZE = 10;
 
const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "accepted", label: "Accepted" },
  { value: "wrong_answer", label: "Wrong Answer" },
  { value: "tle", label: "Time Limit Exceeded" },
  { value: "mle", label: "Memory Limit Exceeded" },
  { value: "runtime_error", label: "Runtime Error" },
  { value: "compile_error", label: "Compile Error" },
];
 
const LANGUAGE_OPTIONS = [
  { value: "all", label: "All languages" },
  { value: "cpp", label: "C++17" },
  { value: "python", label: "Python 3" },
  { value: "java", label: "Java 17" },
  { value: "javascript", label: "JavaScript" },
];
 
const VERDICT_STYLE = {
  Accepted: { label: "Accepted", icon: CheckCircle2, className: "text-emerald-400" },
  accepted: { label: "Accepted", icon: CheckCircle2, className: "text-emerald-400" },
  "Wrong Answer": { label: "Wrong Answer", icon: XCircle, className: "text-red-400" },
  wrong_answer: { label: "Wrong Answer", icon: XCircle, className: "text-red-400" },
  "Time Limit Exceeded": { label: "Time Limit Exceeded", icon: Clock3, className: "text-yellow-400" },
  tle: { label: "Time Limit Exceeded", icon: Clock3, className: "text-yellow-400" },
  "Memory Limit Exceeded": { label: "Memory Limit Exceeded", icon: AlertTriangle, className: "text-yellow-400" },
  mle: { label: "Memory Limit Exceeded", icon: AlertTriangle, className: "text-yellow-400" },
  "Runtime Error": { label: "Runtime Error", icon: Ban, className: "text-orange-400" },
  runtime_error: { label: "Runtime Error", icon: Ban, className: "text-orange-400" },
  "Compilation Error": { label: "Compile Error", icon: Ban, className: "text-orange-400" },
  compile_error: { label: "Compile Error", icon: Ban, className: "text-orange-400" },
  Pending: { label: "In Queue", icon: Loader2, className: "text-slate-400" },
  pending: { label: "In Queue", icon: Loader2, className: "text-slate-400" },
  judging: { label: "Judging", icon: Loader2, className: "text-slate-400" },
};
 
export default function Submissions() {
  const [status, setStatus] = useState("all");
  const [language, setLanguage] = useState("all");
  const [page, setPage] = useState(1);
 
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);
 
  useEffect(() => {
    document.title = "My Submissions | CodeDour";
  }, []);

  useEffect(() => {
    let cancelled = false;
 
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await submissionService.getSubmissions({
          status: status === "all" ? undefined : status,
          language: language === "all" ? undefined : language,
          page,
          pageSize: PAGE_SIZE,
        });
        if (cancelled) return;
        setSubmissions(data.items || data.submissions || []);
        setTotal(data.total || 0);
      } catch (err) {
        if (!cancelled) setError(err.message || "Couldn't load submissions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
 
    load();
    return () => {
      cancelled = true;
    };
  }, [status, language, page]);

  const handleCopyCode = (codeText) => {
    if (!codeText) return;
    navigator.clipboard?.writeText(codeText);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 1500);
  };
 
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
 
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-4xl font-bold">Submissions</h1>
          <p className="mt-2 text-slate-400">
            Track the status and history of everything you've submitted.
          </p>
        </div>
      </div>
 
      <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-4 px-6 md:flex-row">
        <div className="relative">
          <Filter className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 py-3 pl-10 pr-8 outline-none focus:border-indigo-500 md:w-56"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
 
        <div className="relative">
          <Filter className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
          <select
            value={language}
            onChange={(e) => {
              setPage(1);
              setLanguage(e.target.value);
            }}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 py-3 pl-10 pr-8 outline-none focus:border-indigo-500 md:w-48"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
 
      <div className="mx-auto mt-8 max-w-7xl px-6">
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full">
            <thead className="bg-slate-900 text-left text-slate-400">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th>Problem</th>
                <th>Language</th>
                <th>Time</th>
                <th>Memory</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <Loader2 className="mx-auto mb-2 animate-spin" size={20} />
                    Loading submissions...
                  </td>
                </tr>
              )}
 
              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              )}
 
              {!loading && !error && submissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    No submissions match these filters yet.
                  </td>
                </tr>
              )}
 
              {!loading &&
                !error &&
                submissions.map((sub) => {
                  const verdict = VERDICT_STYLE[sub.status] || VERDICT_STYLE.wrong_answer;
                  const VerdictIcon = verdict.icon;
 
                  return (
                    <tr
                      key={sub.id}
                      className="border-t border-slate-800 hover:bg-slate-900/60 transition"
                    >
                      <td className="px-6 py-5">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className={`flex items-center gap-1.5 text-sm font-medium ${verdict.className} hover:underline cursor-pointer text-left`}
                          title="Click to view submitted code"
                        >
                          <VerdictIcon
                            size={16}
                            className={sub.status === "pending" || sub.status === "judging" ? "animate-spin" : ""}
                          />
                          {verdict.label}
                        </button>
                      </td>
                      <td className="font-medium">
                        <Link
                          to={`/problems/${sub.problemId}`}
                          className="hover:text-indigo-400"
                        >
                          {sub.problemTitle}
                        </Link>
                      </td>
                      <td className="text-slate-400">{sub.language}</td>
                      <td className="text-slate-400">{sub.time ?? "—"}</td>
                      <td className="text-slate-400">{sub.memory ?? "—"}</td>
                      <td className="text-slate-400">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "—"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
 
        {!loading && !error && submissions.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <span>
              Page {page} of {totalPages} · {total} submissions
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-slate-800 px-3 py-2 hover:border-slate-600 disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-lg border border-slate-800 px-3 py-2 hover:border-slate-600 disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Submission #{selectedSubmission.id} - {selectedSubmission.problemTitle}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span className="font-semibold text-indigo-400">{selectedSubmission.language}</span>
                  <span>·</span>
                  <span>{selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt).toLocaleString() : "—"}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Submitted Code
                </span>
                {selectedSubmission.code && (
                  <button
                    onClick={() => handleCopyCode(selectedSubmission.code)}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    {codeCopied ? <Check size={14} /> : <Copy size={14} />}
                    {codeCopied ? "Copied" : "Copy Code"}
                  </button>
                )}
              </div>

              {selectedSubmission.code ? (
                <pre className="max-h-96 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-sm leading-relaxed text-slate-200">
                  <code>{selectedSubmission.code}</code>
                </pre>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  No code snippet recorded for this submission.
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-800 px-6 py-3">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}