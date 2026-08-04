import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Clock3,
  Database,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Check,
  Play,
  Send,
  Terminal,
  FileText,
  History,
} from "lucide-react";
import submissionService from "../services/submissionService";
 
// TODO: replace with problemService.getProblemById(problemId) in a useEffect —
// left as static mock data for now since fetching/loading/error state for the
// problem itself is a separate piece of work from the run/submit wiring below.
const problem = {
  id: 3,
  title: "Longest Increasing Subsequence",
  difficulty: "Medium",
  category: "Dynamic Programming",
  acceptance: "61%",
  timeLimit: "1.0s",
  memoryLimit: "256 MB",
  tags: ["dp", "binary-search", "arrays"],
  statement: `Given an integer array nums, return the length of the longest strictly increasing subsequence.
 
A subsequence is derived from the array by deleting some or no elements without changing the order of the remaining elements.`,
  inputFormat: `The first line contains a single integer n (1 \u2264 n \u2264 2500) \u2014 the size of the array.
The second line contains n integers nums[i] (-10^4 \u2264 nums[i] \u2264 10^4).`,
  outputFormat: `Print a single integer \u2014 the length of the longest strictly increasing subsequence.`,
  examples: [
    {
      input: "8\n10 9 2 5 3 7 101 18",
      output: "4",
      note: "The subsequence is [2, 3, 7, 101], length 4.",
    },
    {
      input: "1\n0",
      output: "1",
      note: undefined,
    },
  ],
  constraintsNote: "Can you devise an O(n log n) solution?",
};
 
const LANGUAGES = [
  {
    id: "cpp",
    label: "C++17",
    starter: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}\n`,
  },
  {
    id: "python",
    label: "Python 3",
    starter: `def solve():\n    # your code here\n    pass\n\nsolve()\n`,
  },
  {
    id: "java",
    label: "Java 17",
    starter: `public class Main {\n    public static void main(String[] args) {\n        // your code here\n    }\n}\n`,
  },
  {
    id: "javascript",
    label: "JavaScript",
    starter: `// your code here\n`,
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
 
  const setCode = (value) =>
    setCodeByLanguage((prev) => ({ ...prev, [languageId]: value }));
 
  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
 
  const handleRun = async (mode) => {
    setRunState("running");
    setVerdict({ mode });
 
    try {
      if (mode === "run") {
        // Sample tests only — synchronous, nothing persisted.
        const result = await submissionService.runCode({
          problemId,
          language: languageId,
          code,
        });
 
        const passedCount = result.results.filter((r) => r.passed).length;
        const allPassed = passedCount === result.results.length;
 
        setRunState(allPassed ? "passed" : "failed");
        setVerdict({
          mode,
          label: allPassed ? "Accepted" : "Wrong Answer",
          time: result.time,
          memory: result.memory,
          testsPassed: passedCount,
          totalTests: result.results.length,
        });
      } else {
        // Full judge — queued on the backend, so poll until Judge0 finishes.
        const queued = await submissionService.submitSolution({
          problemId,
          language: languageId,
          code,
        });
 
        const final = await submissionService.pollSubmission(queued.id);
 
        const passed = final.status === "accepted";
        setRunState(passed ? "passed" : "failed");
        setVerdict({
          mode,
          label: final.statusLabel || (passed ? "Accepted" : "Wrong Answer"),
          time: final.time,
          memory: final.memory,
          testsPassed: final.testsPassed,
          totalTests: final.totalTests,
        });
      }
    } catch (err) {
      setRunState("failed");
      setVerdict({
        mode,
        label: err.message || "Something went wrong while judging.",
        time: "—",
        memory: "—",
        testsPassed: 0,
        totalTests: 1,
      });
    }
  };
 
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <div className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to="/problems"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <ChevronLeft size={16} />
            Back to Problems
          </Link>
 
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock3 size={15} />
              {problem.timeLimit}
            </span>
            <span className="flex items-center gap-1.5">
              <Database size={15} />
              {problem.memoryLimit}
            </span>
          </div>
        </div>
      </div>
 
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
          </div>
 
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span>{problem.acceptance} acceptance</span>
            <div className="flex flex-wrap gap-2">
              {problem.tags.map((tag) => (
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
              <p className="whitespace-pre-line">{problem.statement}</p>
 
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Input
                </h3>
                <p className="whitespace-pre-line">{problem.inputFormat}</p>
              </div>
 
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Output
                </h3>
                <p className="whitespace-pre-line">{problem.outputFormat}</p>
              </div>
 
              {/* Examples */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Examples
                </h3>
 
                <div className="flex gap-2">
                  {problem.examples.map((_, i) => (
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
 
                <div className="mt-3 space-y-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-900">
                    <div className="border-b border-slate-800 px-4 py-2 text-xs font-medium text-slate-500">
                      Input
                    </div>
                    <pre className="overflow-x-auto p-4 font-mono text-xs text-slate-300">
                      {problem.examples[activeExample].input}
                    </pre>
                  </div>
 
                  <div className="rounded-lg border border-slate-800 bg-slate-900">
                    <div className="border-b border-slate-800 px-4 py-2 text-xs font-medium text-slate-500">
                      Output
                    </div>
                    <pre className="overflow-x-auto p-4 font-mono text-xs text-slate-300">
                      {problem.examples[activeExample].output}
                    </pre>
                  </div>
 
                  {problem.examples[activeExample].note && (
                    <p className="text-xs text-slate-500">
                      {problem.examples[activeExample].note}
                    </p>
                  )}
                </div>
              </div>
 
              <p className="text-slate-400">{problem.constraintsNote}</p>
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-center gap-2 text-center text-slate-500">
              <History size={28} />
              <p className="text-sm">No submissions yet for this problem.</p>
            </div>
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
                onClick={() => handleRun("run")}
                disabled={runState === "running"}
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:border-slate-500 hover:bg-slate-800/50 disabled:opacity-50"
              >
                <Play size={15} />
                Run
              </button>
              <button
                onClick={() => handleRun("submit")}
                disabled={runState === "running"}
                className="flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2 text-sm font-semibold hover:bg-indigo-400 disabled:opacity-50"
              >
                <Send size={15} />
                Submit
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
                  Run your code against the sample tests, or submit to judge
                  against the full test suite.
                </p>
              )}
 
              {runState === "running" && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                  {verdict?.mode === "submit"
                    ? "Judging submission..."
                    : "Running sample tests..."}
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
                      {verdict.time} \u00b7 {verdict.memory}
                    </span>
                  </div>
 
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                      <span>Test cases</span>
                      <span>
                        {verdict.testsPassed}/{verdict.totalTests}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          runState === "passed"
                            ? "bg-emerald-400"
                            : "bg-red-400"
                        }`}
                        style={{
                          width: `${
                            (verdict.testsPassed / verdict.totalTests) * 100
                          }%`,
                        }}
                      />
                    </div>
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