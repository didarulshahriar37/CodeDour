import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Clock3,
  Database,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Check,
  Send,
  Terminal,
  FileText,
  History,
  X,
} from "lucide-react";
import problemService from "../services/problemService";
import submissionService from "../services/submissionService";
import { useAuth } from "../context/AuthContext";

const LANGUAGES = [
  {
    id: "c",
    label: "C (GCC)",
    judge0Id: 50,
    starter: `#include <stdio.h>\n\nint main() {\n    // your code here\n    return 0;\n}\n`,
  },
  {
    id: "cpp",
    label: "C++ 17",
    judge0Id: 54,
    starter: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}\n`,
  },
  {
    id: "python",
    label: "Python 3",
    judge0Id: 71,
    starter: `import sys\n\ndef solve():\n    # your code here\n    pass\n\nif __name__ == '__main__':\n    solve()\n`,
  },
  {
    id: "java",
    label: "Java 17",
    judge0Id: 62,
    starter: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // your code here\n    }\n}\n`,
  },
  {
    id: "javascript",
    label: "JavaScript (Node.js)",
    judge0Id: 63,
    starter: `const fs = require('fs');\n// your code here\n`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    judge0Id: 74,
    starter: `import * as fs from 'fs';\n// your code here\n`,
  },
  {
    id: "csharp",
    label: "C#",
    judge0Id: 51,
    starter: `using System;\n\nclass Program {\n    static void Main() {\n        // your code here\n    }\n}\n`,
  },
  {
    id: "go",
    label: "Go",
    judge0Id: 60,
    starter: `package main\nimport "fmt"\n\nfunc main() {\n    // your code here\n}\n`,
  },
  {
    id: "rust",
    label: "Rust",
    judge0Id: 73,
    starter: `use std::io;\n\nfn main() {\n    // your code here\n}\n`,
  },
  {
    id: "php",
    label: "PHP",
    judge0Id: 68,
    starter: `<?php\n// your code here\n`,
  },
  {
    id: "ruby",
    label: "Ruby",
    judge0Id: 72,
    starter: `# your code here\n`,
  },
  {
    id: "kotlin",
    label: "Kotlin",
    judge0Id: 78,
    starter: `# your code here\n`,
  },
  {
    id: "swift",
    label: "Swift",
    judge0Id: 83,
    starter: `import Foundation\n// your code here\n`,
  },
];

const difficultyColor = (difficulty) => {
  switch (difficulty) {
    case "Easy":
      return "text-green-400 bg-green-400/10 border-green-400/30";
    case "Medium":
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    case "Hard":
      return "text-red-400 bg-red-400/10 border-red-400/30";
    default:
      return "text-slate-400 bg-slate-400/10 border-slate-400/30";
  }
};

export default function ProblemDetail() {
  const { id: problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [sampleTestCases, setSampleTestCases] = useState([]);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [problemError, setProblemError] = useState(null);

  const [activeTab, setActiveTab] = useState("description");
  const [languageId, setLanguageId] = useState("cpp");
  const [codeByLanguage, setCodeByLanguage] = useState(() =>
    Object.fromEntries(LANGUAGES.map((l) => [l.id, l.starter]))
  );
  const [activeExample, setActiveExample] = useState(0);
  const [copied, setCopied] = useState(false);
  const [runState, setRunState] = useState("idle"); // idle | running | passed | failed
  const [verdict, setVerdict] = useState(null);

  const language = LANGUAGES.find((l) => l.id === languageId);
  const code = codeByLanguage[languageId];

  const [problemSubmissions, setProblemSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionsError, setSubmissionsError] = useState(null);
  const [selectedSubmissionCode, setSelectedSubmissionCode] = useState(null);

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    setSubmissionsError(null);
    try {
      const data = await submissionService.getSubmissions({
        problemId: problemId,
      });
      setProblemSubmissions(data.items || data.submissions || []);
    } catch (err) {
      setSubmissionsError(err.message || "Failed to load submissions.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchProblem() {
      setLoadingProblem(true);
      setProblemError(null);
      try {
        const data = await problemService.getProblemById(problemId);
        if (cancelled) return;
        setProblem(data.problem);
        setSampleTestCases(data.sample_test_cases || []);
        if (data.problem?.title) {
          document.title = `${data.problem.title} | CodeDour`;
        }
      } catch (err) {
        if (!cancelled) {
          setProblemError(err.message || "Problem not found");
        }
      } finally {
        if (!cancelled) setLoadingProblem(false);
      }
    }

    fetchProblem();

    return () => {
      cancelled = true;
    };
  }, [problemId]);

  useEffect(() => {
    if (activeTab === "submissions") {
      fetchSubmissions();
    }
  }, [activeTab, problemId]);

  const setCode = (value) =>
    setCodeByLanguage((prev) => ({ ...prev, [languageId]: value }));

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const { refreshProfile } = useAuth();

  const handleRun = async () => {
    setRunState("running");
    setVerdict(null);

    try {
      const res = await submissionService.submitSolution({
        problem_id: problemId,
        language: language.label,
        language_id: language.judge0Id,
        code,
      });

      const isAccepted = res.verdict === "Accepted";
      setRunState(isAccepted ? "passed" : "failed");
      setVerdict({
        label: res.verdict || "Completed",
        time: res.execution_time !== undefined ? `${res.execution_time}s` : "—",
        memory: res.memory_used !== undefined ? `${res.memory_used} KB` : "—",
        results: res.results || []
      });

      // Refresh global profile state and submissions list instantly
      refreshProfile().catch(() => {});
      fetchSubmissions().catch(() => {});
    } catch (err) {
      setRunState("failed");
      setVerdict({
        label: err.message || "Something went wrong while judging.",
        time: "—",
        memory: "—",
      });
    }
  };

  if (loadingProblem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="animate-spin text-indigo-400" size={32} />
      </div>
    );
  }

  if (problemError || !problem) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <p className="text-xl text-red-400">{problemError || "Problem not found"}</p>
        <Link to="/problems" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400">
          Back to Problems
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Split layout */}
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-2">
        {/* Left: statement */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${difficultyColor(
                problem.difficulty
              )}`}
            >
              {problem.difficulty}
            </span>

            <div className="flex items-center gap-3 text-xs text-slate-400 border-l border-slate-800 pl-3">
              <span className="flex items-center gap-1">
                <Clock3 size={14} />
                {problem.time_limit || 1.0}s
              </span>
              <span className="flex items-center gap-1">
                <Database size={14} />
                {problem.memory_limit || 256} MB
              </span>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span>
              {problem.total_submissions > 0
                ? `${Math.round(((problem.accepted_submissions || 0) / problem.total_submissions) * 100)}%`
                : "0%"} acceptance
            </span>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(problem.tags) && problem.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-900 px-2 py-0.5 text-xs text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-6 border-b border-slate-800">
            {[
              { id: "description", label: "Description", icon: FileText },
              { id: "submissions", label: "Submissions", icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 border-b-2 pb-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-white"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "description" ? (
            <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-300">
              <p className="whitespace-pre-line">{problem.description}</p>

              {problem.input_format && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Input Format
                  </h3>
                  <p className="whitespace-pre-line">{problem.input_format}</p>
                </div>
              )}

              {problem.output_format && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Output Format
                  </h3>
                  <p className="whitespace-pre-line">{problem.output_format}</p>
                </div>
              )}

              {/* Sample Test Cases */}
              {sampleTestCases.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Examples
                  </h3>

                  <div className="flex gap-2">
                    {sampleTestCases.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveExample(i)}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                          activeExample === i
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-900 text-slate-400 hover:text-white"
                        }`}
                      >
                        Example {i + 1}
                      </button>
                    ))}
                  </div>

                  {sampleTestCases[activeExample] && (
                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg border border-slate-800 bg-slate-900">
                        <div className="border-b border-slate-800 px-4 py-2 text-xs font-medium text-slate-500">
                          Input
                        </div>
                        <pre className="overflow-x-auto p-4 font-mono text-xs text-slate-300">
                          {sampleTestCases[activeExample].input?.replace(/\\n/g, '\n')}
                        </pre>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-slate-900">
                        <div className="border-b border-slate-800 px-4 py-2 text-xs font-medium text-slate-500">
                          Output
                        </div>
                        <pre className="overflow-x-auto p-4 font-mono text-xs text-slate-300">
                          {sampleTestCases[activeExample].expected_output?.replace(/\\n/g, '\n')}
                        </pre>
                      </div>

                      {sampleTestCases[activeExample].explanation && (
                        <p className="text-xs text-slate-500">
                          {sampleTestCases[activeExample].explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {problem.constraints && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Constraints
                  </h3>
                  <p className="whitespace-pre-line text-slate-400">{problem.constraints}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {loadingSubmissions && (
                <div className="py-12 text-center text-slate-500">
                  <Loader2 className="mx-auto mb-2 animate-spin" size={20} />
                  Loading your submissions...
                </div>
              )}

              {!loadingSubmissions && submissionsError && (
                <div className="py-8 text-center text-red-400 text-sm">
                  {submissionsError}
                </div>
              )}

              {!loadingSubmissions && !submissionsError && problemSubmissions.length === 0 && (
                <div className="mt-10 flex flex-col items-center gap-2 text-center text-slate-500">
                  <History size={28} />
                  <p className="text-sm">You haven't submitted any code for this problem yet.</p>
                </div>
              )}

              {!loadingSubmissions && !submissionsError && problemSubmissions.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Language</th>
                        <th className="px-4 py-3 font-semibold">Time</th>
                        <th className="px-4 py-3 font-semibold">Memory</th>
                        <th className="px-4 py-3 font-semibold">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {problemSubmissions.map((sub) => {
                        const isAcc = sub.status === "Accepted";
                        return (
                          <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                            <td className="px-4 py-3 font-medium">
                              <button
                                onClick={() => setSelectedSubmissionCode(sub.code)}
                                className={`flex items-center gap-1.5 hover:underline ${
                                  isAcc ? "text-emerald-400" : "text-red-400"
                                }`}
                                title="Click to view submitted code"
                              >
                                {isAcc ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                {sub.status}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-slate-300">{sub.language}</td>
                            <td className="px-4 py-3 text-slate-400">{sub.time ? `${sub.time}s` : "—"}</td>
                            <td className="px-4 py-3 text-slate-400">{sub.memory ? `${sub.memory} KB` : "—"}</td>
                            <td className="px-4 py-3 text-slate-400">
                              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {selectedSubmissionCode && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              onClick={() => setSelectedSubmissionCode(null)}
            >
              <div
                className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                  <h3 className="text-base font-bold text-white">Submitted Code</h3>
                  <button
                    onClick={() => setSelectedSubmissionCode(null)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6">
                  <pre className="max-h-96 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200">
                    <code>{selectedSubmissionCode}</code>
                  </pre>
                </div>
                <div className="flex justify-end border-t border-slate-800 px-6 py-3">
                  <button
                    onClick={() => setSelectedSubmissionCode(null)}
                    className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>            </div>
          )}
        </div>

        {/* Right: editor */}
        <div className="flex min-w-0 flex-col">
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80">
            {/* editor toolbar */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>

              <select
                value={languageId}
                onChange={(e) => setLanguageId(e.target.value)}
                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-200 outline-none focus:border-indigo-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* code area */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="h-80 w-full resize-none bg-transparent p-5 font-mono text-sm leading-relaxed text-slate-200 outline-none"
            />

            {/* actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-5 py-3">
              <button
                onClick={handleRun}
                disabled={runState === "running"}
                className="flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2 text-sm font-semibold hover:bg-indigo-400 disabled:opacity-50"
              >
                <Send size={15} />
                Submit Code
              </button>
            </div>
          </div>

          {/* verdict console */}
          <div className="mt-4 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3 text-xs font-medium text-slate-500">
              <Terminal size={14} />
              Result
            </div>

            <div className="p-5">
              {runState === "idle" && (
                <p className="text-sm text-slate-500">
                  Submit your code to judge against test cases on Judge0.
                </p>
              )}

              {runState === "running" && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                  Judging submission...
                </div>
              )}

              {(runState === "passed" || runState === "failed") && verdict && (
                <div>
                  <div className="flex items-center gap-2">
                    {runState === "passed" ? (
                      <CheckCircle2 className="text-emerald-400" size={18} />
                    ) : (
                      <XCircle className="text-red-400" size={18} />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        runState === "passed"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {verdict.label}
                    </span>
                    <span className="ml-auto text-xs text-slate-500">
                      {verdict.time} · {verdict.memory}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}