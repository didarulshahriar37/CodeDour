import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Users,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import leaderboardService from "../services/leaderboardService";
import contestService from "../services/contestService";
 
const PAGE_SIZE = 20;
 
const TIMEFRAMES = [
  { value: "all", label: "All time" },
  { value: "monthly", label: "This month" },
  { value: "weekly", label: "This week" },
];
 
const rankStyle = (rank) => {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-slate-300";
  if (rank === 3) return "text-amber-600";
  return "text-slate-400";
};
 
export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("global"); // "global" | "contest"
 
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-400" size={34} />
            <h1 className="text-4xl font-bold">Leaderboard</h1>
          </div>
          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            See who's leading overall, or dive into the standings for a
            specific contest.
          </p>
 
          {/* Tabs */}
          <div className="mt-8 flex gap-2">
            <button
              onClick={() => setActiveTab("global")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === "global"
                  ? "bg-indigo-500 text-white"
                  : "border border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white"
              }`}
            >
              Global Leaderboard
            </button>
            <button
              onClick={() => setActiveTab("contest")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === "contest"
                  ? "bg-indigo-500 text-white"
                  : "border border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white"
              }`}
            >
              Contest Leaderboard
            </button>
          </div>
        </div>
      </div>
 
      <div className="mx-auto max-w-6xl px-6 py-10">
        {activeTab === "global" ? <GlobalLeaderboard /> : <ContestLeaderboardTab />}
      </div>
    </div>
  );
}
 
function GlobalLeaderboard() {
  const [timeframe, setTimeframe] = useState("all");
  const [page, setPage] = useState(1);
 
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    let cancelled = false;
 
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await leaderboardService.getGlobalLeaderboard({
          timeframe,
          page,
          pageSize: PAGE_SIZE,
        });
        if (cancelled) return;
        setEntries(data.items);
        setTotal(data.total);
      } catch (err) {
        if (!cancelled) setError(err.message || "Couldn't load the leaderboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
 
    load();
    return () => {
      cancelled = true;
    };
  }, [timeframe, page]);
 
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
 
  return (
    <>
      {/* Timeframe filter */}
      <div className="flex gap-2">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => {
              setPage(1);
              setTimeframe(tf.value);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              timeframe === tf.value
                ? "bg-indigo-500 text-white"
                : "border border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white"
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>
 
      {loading && (
        <div className="mt-16 flex items-center justify-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" size={20} />
          Loading rankings...
        </div>
      )}
 
      {!loading && error && (
        <div className="mt-16 text-center text-red-400">{error}</div>
      )}
 
      {!loading && !error && entries.length === 0 && (
        <div className="mt-16 text-center text-slate-500">No rankings yet.</div>
      )}
 
      {!loading && !error && entries.length > 0 && (
        <>
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full">
              <thead className="bg-slate-900 text-left text-slate-400">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Solved</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.rank}
                    className="border-t border-slate-800 hover:bg-slate-900/60 transition"
                  >
                    <td className={`px-6 py-4 font-semibold ${rankStyle(entry.rank)}`}>
                      {entry.rank}
                    </td>
                    <td className="font-medium">
                      <Link to={`/users/${entry.username}`} className="hover:text-indigo-400">
                        {entry.username}
                      </Link>
                    </td>
                    <td className="text-slate-400">{entry.rating}</td>
                    <td className="text-slate-400">{entry.solvedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
 
          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <span>
              Page {page} of {totalPages} · {total} ranked users
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
        </>
      )}
    </>
  );
}
 
function ContestLeaderboardTab() {
  const [contests, setContests] = useState([]);
  const [loadingContests, setLoadingContests] = useState(true);
  const [contestsError, setContestsError] = useState(null);
 
  const [selectedContest, setSelectedContest] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [standingsError, setStandingsError] = useState(null);
 
  // Load the contest list (running + ended) once.
  useEffect(() => {
    let cancelled = false;
 
    async function load() {
      setLoadingContests(true);
      setContestsError(null);
      try {
        const data = await contestService.getContests();
        if (cancelled) return;
        setContests(data.filter((c) => c.status === "running" || c.status === "past"));
      } catch (err) {
        if (!cancelled) setContestsError(err.message || "Couldn't load contests.");
      } finally {
        if (!cancelled) setLoadingContests(false);
      }
    }
 
    load();
    return () => {
      cancelled = true;
    };
  }, []);
 
  // Load standings whenever a contest is selected.
  useEffect(() => {
    if (!selectedContest) return;
 
    let cancelled = false;
    setLoadingStandings(true);
    setStandingsError(null);
 
    contestService
      .getContestLeaderboard(selectedContest.id)
      .then((data) => {
        if (!cancelled) setStandings(data);
      })
      .catch((err) => {
        if (!cancelled) setStandingsError(err.message || "Couldn't load standings.");
      })
      .finally(() => {
        if (!cancelled) setLoadingStandings(false);
      });
 
    return () => {
      cancelled = true;
    };
  }, [selectedContest]);
 
  // ---- Standings view for the selected contest ----
  if (selectedContest) {
    return (
      <div>
        <button
          onClick={() => {
            setSelectedContest(null);
            setStandings([]);
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
        >
          <ChevronLeft size={16} />
          Back to Contests
        </button>
 
        <h2 className="mt-4 text-2xl font-bold">{selectedContest.title}</h2>
 
        {loadingStandings && (
          <div className="mt-16 flex items-center justify-center gap-2 text-slate-500">
            <Loader2 className="animate-spin" size={20} />
            Loading standings...
          </div>
        )}
 
        {!loadingStandings && standingsError && (
          <div className="mt-16 text-center text-red-400">{standingsError}</div>
        )}
 
        {!loadingStandings && !standingsError && standings.length === 0 && (
          <div className="mt-16 text-center text-slate-500">No standings yet.</div>
        )}
 
        {!loadingStandings && !standingsError && standings.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full">
              <thead className="bg-slate-900 text-left text-slate-400">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th>Participant</th>
                  <th>Rating</th>
                  <th>Solved</th>
                  <th>Penalty</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((entry) => (
                  <tr
                    key={entry.rank}
                    className="border-t border-slate-800 hover:bg-slate-900/60 transition"
                  >
                    <td className={`px-6 py-4 font-semibold ${rankStyle(entry.rank)}`}>
                      {entry.rank}
                    </td>
                    <td className="font-medium">
                      <Link to={`/users/${entry.username}`} className="hover:text-indigo-400">
                        {entry.username}
                      </Link>
                    </td>
                    <td className="text-slate-400">{entry.rating}</td>
                    <td className="text-slate-400">{entry.solvedCount}</td>
                    <td className="text-slate-400">{entry.penalty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
 
  // ---- Contest list ----
  if (loadingContests) {
    return (
      <div className="mt-16 flex items-center justify-center gap-2 text-slate-500">
        <Loader2 className="animate-spin" size={20} />
        Loading contests...
      </div>
    );
  }
 
  if (contestsError) {
    return <div className="mt-16 text-center text-red-400">{contestsError}</div>;
  }
 
  const running = contests.filter((c) => c.status === "running");
  const past = contests.filter((c) => c.status === "past");
 
  return (
    <div>
      {running.length > 0 && (
        <>
          <h2 className="mb-4 text-lg font-bold">Running</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {running.map((contest) => (
              <ContestCard
                key={contest.id}
                contest={contest}
                onClick={() => setSelectedContest(contest)}
                live
              />
            ))}
          </div>
        </>
      )}
 
      <h2 className="mb-4 mt-10 text-lg font-bold">Ended</h2>
      {past.length === 0 ? (
        <p className="text-sm text-slate-500">No ended contests yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {past.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              onClick={() => setSelectedContest(contest)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
 
function ContestCard({ contest, onClick, live }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-indigo-500"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{contest.title}</h3>
        {live && (
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold">
            LIVE
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Users size={13} />
          {contest.participants}
        </span>
        {contest.duration && (
          <span className="flex items-center gap-1">
            <Clock3 size={13} />
            {contest.duration}
          </span>
        )}
      </div>
    </button>
  );
}
 