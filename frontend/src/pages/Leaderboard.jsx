import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Crown,
  Medal,
  Search,
  CheckCircle2,
  Target,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import leaderboardService from "../services/leaderboardService";
 
const LIMIT = 20;
 
const podiumStyles = {
  1: {
    order: "md:order-2",
    ring: "border-yellow-400/60",
    glow: "from-yellow-500/20 to-slate-900",
    badge: "bg-yellow-400 text-slate-950",
    icon: <Crown className="text-yellow-400" size={28} />,
    height: "md:pt-0",
  },
  2: {
    order: "md:order-1",
    ring: "border-slate-400/40",
    glow: "from-slate-400/10 to-slate-900",
    badge: "bg-slate-300 text-slate-950",
    icon: <Medal className="text-slate-300" size={24} />,
    height: "md:pt-8",
  },
  3: {
    order: "md:order-3",
    ring: "border-amber-700/50",
    glow: "from-amber-700/20 to-slate-900",
    badge: "bg-amber-600 text-slate-950",
    icon: <Medal className="text-amber-600" size={24} />,
    height: "md:pt-8",
  },
};
 
function ratingColor(rating) {
  if (rating >= 2300) return "text-red-400";
  if (rating >= 2100) return "text-orange-400";
  if (rating >= 1900) return "text-purple-400";
  if (rating >= 1600) return "text-indigo-400";
  return "text-emerald-400";
}
 
function displayNameOf(user) {
  return user.display_name || user.username;
}
 
export default function Leaderboard() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);
 
  useEffect(() => {
    let cancelled = false;
 
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);
      try {
        const data = await leaderboardService.getGlobalLeaderboard({
          search: debouncedSearch,
          page,
          limit: LIMIT,
        });
        if (!cancelled) {
          setLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Could not load the leaderboard. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
 
    fetchLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, page]);
 
  const showPodium = page === 1 && debouncedSearch === "" && leaderboard.length >= 3;
  const top3 = showPodium ? leaderboard.slice(0, 3) : [];
  const rest = showPodium ? leaderboard.slice(3) : leaderboard;
 
  return (
    <div className="min-h-screen bg-slate-950 text-white">
 
      <div className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-400" size={34} />
            <h1 className="text-4xl font-bold">Global Leaderboard</h1>
          </div>
 
          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            See how you stack up against the best problem solvers on
            CodeDour, ranked by rating across every contest and submission.
          </p>
        </div>
      </div>
 
      <div className="mx-auto max-w-7xl px-6 py-10">
 
        {showPodium && (
          <div className="grid gap-6 md:grid-cols-3 md:items-end">
            {top3.map((user) => {
              const rankIn3 = top3.indexOf(user) + 1;
              const style = podiumStyles[rankIn3];
              return (
                <div
                  key={user.user_id}
                  className={`${style.order} ${style.height} rounded-2xl border ${style.ring} bg-gradient-to-b ${style.glow} p-6 text-center`}
                >
                  <div className="flex justify-center">{style.icon}</div>
 
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={displayNameOf(user)}
                      className="mx-auto mt-4 h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold ${style.badge}`}
                    >
                      {displayNameOf(user).charAt(0).toUpperCase()}
                    </div>
                  )}
 
                  <h3 className="mt-4 flex items-center justify-center gap-1 text-xl font-semibold">
                    {displayNameOf(user)}
                    {user.role === "admin" && (
                      <ShieldCheck size={16} className="text-indigo-400" />
                    )}
                  </h3>
 
                  <p className={`mt-1 text-2xl font-bold ${ratingColor(user.rating)}`}>
                    {user.rating}
                  </p>
                  <p className="text-xs text-slate-500">
                    Peak {user.max_rating}
                  </p>
 
                  <div className="mt-4 flex justify-center gap-6 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 size={16} />
                      {user.problems_solved}
                    </div>
 
                    <div className="flex items-center gap-1">
                      <Target size={16} />
                      {user.accuracy_rate}%
                    </div>
                  </div>
 
                  <Link
                    to={`/profile/${user.user_id}`}
                    className="mt-6 inline-block rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800 transition"
                  >
                    View Profile
                  </Link>
                </div>
              );
            })}
          </div>
        )}
 
 
        <div className={`${showPodium ? "mt-14" : "mt-2"} flex items-center justify-between gap-4`}>
          <h2 className="text-2xl font-bold">Full Rankings</h2>
 
          <div className="relative w-full max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search username..."
              className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>
 
 
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-6 py-4 text-left">Rank</th>
                <th className="text-left">User</th>
                <th className="text-left">Rating</th>
                <th className="text-left">Solved</th>
                <th className="text-left">Accuracy</th>
              </tr>
            </thead>
 
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    <Loader2 className="mx-auto animate-spin" size={22} />
                  </td>
                </tr>
              )}
 
              {!loading && error && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              )}
 
              {!loading && !error && rest.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    No users found{debouncedSearch ? ` matching "${debouncedSearch}"` : ""}.
                  </td>
                </tr>
              )}
 
              {!loading &&
                !error &&
                rest.map((user) => (
                  <tr
                    key={user.user_id}
                    className="border-t border-slate-800 hover:bg-slate-900 transition"
                  >
                    <td className="px-6 py-5 font-medium text-slate-400">
                      #{user.global_rank}
                    </td>
 
                    <td>
                      <Link
                        to={`/profile/${user.user_id}`}
                        className="flex items-center gap-2 font-medium hover:text-indigo-400 transition"
                      >
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={displayNameOf(user)}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold">
                            {displayNameOf(user).charAt(0).toUpperCase()}
                          </span>
                        )}
                        {displayNameOf(user)}
                        {user.role === "admin" && (
                          <ShieldCheck size={14} className="text-indigo-400" />
                        )}
                      </Link>
                    </td>
 
                    <td className={`font-semibold ${ratingColor(user.rating)}`}>
                      {user.rating}
                    </td>
 
                    <td>{user.problems_solved}</td>
 
                    <td>{user.accuracy_rate}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
 
 
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800 transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
 
          <span className="text-sm text-slate-500">Page {page}</span>
 
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loading || leaderboard.length < LIMIT}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800 transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
 