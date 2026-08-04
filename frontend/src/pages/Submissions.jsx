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
  accepted: { label: "Accepted", icon: CheckCircle2, className: "text-emerald-400" },
  wrong_answer: { label: "Wrong Answer", icon: XCircle, className: "text-red-400" },
  tle: { label: "Time Limit Exceeded", icon: Clock3, className: "text-yellow-400" },
  mle: { label: "Memory Limit Exceeded", icon: AlertTriangle, className: "text-yellow-400" },
  runtime_error: { label: "Runtime Error", icon: Ban, className: "text-orange-400" },
  compile_error: { label: "Compile Error", icon: Ban, className: "text-orange-400" },
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
        setSubmissions(data.items);
        setTotal(data.total);
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
 
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
 
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-4xl font-bold">Submissions</h1>
          <p className="mt-2 text-slate-400">
            Track the status and history of everything you've submitted.
          </p>
        </div>
      </div>
 
      {/* Filters */}
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
 
      {/* Table */}
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
                        <span className={`flex items-center gap-1.5 text-sm font-medium ${verdict.className}`}>
                          <VerdictIcon
                            size={16}
                            className={sub.status === "pending" || sub.status === "judging" ? "animate-spin" : ""}
                          />
                          {verdict.label}
                        </span>
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
                      <td className="text-slate-400">{sub.submittedAt}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
 
        {/* Pagination */}
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
    </div>
  );
}