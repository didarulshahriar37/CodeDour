import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  CheckCircle2,
  Circle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import problemService from "../services/problemService";
import { useAuth } from "../context/AuthContext";

export default function Problems() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");

  useEffect(() => {
    document.title = "Problems | CodeDour";
  }, []);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProblems() {
      setLoading(true);
      setError(null);
      try {
        const data = await problemService.getProblems({
          search: search || undefined,
          difficulty: difficulty === "All" ? undefined : difficulty,
        });

        if (cancelled) return;
        setProblems(data.problems || data.items || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load problems");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProblems();

    return () => {
      cancelled = true;
    };
  }, [search, difficulty]);

  const difficultyColor = (diff) => {
    switch (diff) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Hard":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-4xl font-bold">Problems</h1>
          <p className="mt-2 text-slate-400">
            Solve problems, improve your algorithmic thinking, and climb the leaderboard.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-4 px-6 md:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 py-3 pl-12 pr-4 outline-none focus:border-indigo-500"
          />
        </div>

        {/* Difficulty */}
        <div className="relative">
          <Filter className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 py-3 pl-10 pr-8 outline-none focus:border-indigo-500"
          >
            <option value="All">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mx-auto mt-8 max-w-7xl px-6">
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr className="text-left text-slate-400">
                <th className="px-6 py-4">Status</th>
                <th>Problem</th>
                <th>Tag</th>
                <th>Difficulty</th>
                <th>Solved By</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <Loader2 className="mx-auto mb-2 animate-spin" size={20} />
                    Loading problems...
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

              {!loading && !error && problems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    No problems found in the database.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                problems.map((problem) => (
                  <tr
                    key={problem.problem_id || problem.id}
                    className="border-t border-slate-800 hover:bg-slate-900/60 transition"
                  >
                    <td className="px-6 py-5">
                      {problem.solved ? (
                        <CheckCircle2 className="text-green-400" />
                      ) : (
                        <Circle className="text-slate-500" />
                      )}
                    </td>

                    <td className="font-medium">{problem.title}</td>

                    <td className="text-slate-400">
                      {Array.isArray(problem.tags) && problem.tags.length > 0
                        ? problem.tags.join(", ")
                        : problem.category || "—"}
                    </td>

                    <td className={`font-semibold ${difficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </td>

                    <td className="text-slate-300">
                      {problem.solved_by_count ?? 0} {problem.solved_by_count === 1 ? "user" : "users"}
                    </td>

                    <td>
                      <Link
                        to={isAuthenticated ? `/problems/${problem.problem_id || problem.id}` : "/login"}
                        state={!isAuthenticated ? { from: { pathname: `/problems/${problem.problem_id || problem.id}` } } : undefined}
                        className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400 w-fit"
                      >
                        Solve
                        <ArrowRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mx-auto mt-10 max-w-7xl px-6 pb-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-3xl font-bold">{problems.length}</h2>
            <p className="text-slate-400 mt-2">Total Problems</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-3xl font-bold text-green-400">
              {problems.filter((p) => p.solved).length}
            </h2>
            <p className="mt-2 text-slate-400">Solved</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-3xl font-bold text-indigo-400">
              {problems.length - problems.filter((p) => p.solved).length}
            </h2>
            <p className="mt-2 text-slate-400">Remaining</p>
          </div>
        </div>
      </div>
    </div>
  );
}