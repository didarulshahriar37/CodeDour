import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Code2, Zap, ArrowRight, Terminal, CheckCircle2 } from "lucide-react";

function LandingPage() {
  useEffect(() => {
    document.title = "CodeDour - Competitive Programming Platform";
  }, []);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">

      <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
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
              Track your progress and become a better programmer through challenging problems.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/problems"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-colors hover:bg-indigo-400"
              >
                Start solving
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/40">
              <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <Terminal className="h-3.5 w-3.5" />
                  solution.cpp
                </span>
              </div>
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

      <section className="relative flex min-h-[calc(100vh-4rem)] items-center py-12 bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              About CodeDour
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything You Need to Level Up Your Coding
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-base text-slate-400">
              CodeDour is a modern competitive programming platform built to help developers solve algorithmic challenges, sharpen problem-solving skills, and track progress.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 hover:border-slate-700 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">Curated Challenges</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Explore a rich collection of algorithmic problems categorized by difficulty—from basic syntax and arrays to advanced dynamic programming and data structures.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 hover:border-slate-700 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">Instant Multi-Language Judging</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Compile and run your code in real-time across 13 programming languages including C, C++, Python, Java, JavaScript, Rust, Go, and C# with instant test case verdicts.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 hover:border-slate-700 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Terminal className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">Personalized Progress Tracking</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Monitor your total submissions, unique problem solve counts, submission history, and performance metrics directly from your personalized profile dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
