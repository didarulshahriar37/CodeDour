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
  const [activeTab, setActiveTab] = useState("global");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
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
        {activeTab === "global" ? (
          <GlobalLeaderboard />
        ) : (
          <ContestLeaderboardTab />
        )}
      </div>
    </div>
  );
}

function GlobalLeaderboard() {
  const [timeframe, setTimeframe] = useState("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
          search: searchQuery,
        });

        if (cancelled) return;

        setEntries(data.items);
        setTotal(data.total);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Couldn't load the leaderboard."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [timeframe, page, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(search);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
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

        <form
          onSubmit={handleSearch}
          className="flex gap-2 w-full sm:w-auto"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="flex-1 sm:w-64 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition"
          >
            Search
          </button>
        </form>
      </div>

      {loading && (
        <div className="mt-16 flex items-center justify-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" size={20} />
          Loading rankings...
        </div>
      )}

      {!loading && error && (
        <div className="mt-16 text-center text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="mt-16 text-center text-slate-500">
          No rankings yet.
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <>
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full">
              <thead className="bg-slate-900 text-left text-slate-400">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th>User</th>
                  <th>Solved</th>
                </tr>
              </thead>

              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.rank}
                    className="border-t border-slate-800 hover:bg-slate-900/60 transition"
                  >
                    <td
                      className={`px-6 py-4 font-semibold ${rankStyle(
                        entry.rank
                      )}`}
                    >
                      {entry.rank}
                    </td>

                    <td className="font-medium">
                      <Link
                        to={`/profile/${entry.userId}`}
                        className="hover:text-indigo-400"
                      >
                        {entry.username}
                      </Link>
                    </td>

                    <td className="text-slate-400">
                      {entry.solvedCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <span>
              Page {page} of {totalPages} · {total} ranked users
            </span>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-slate-800 px-3 py-2 hover:border-slate-600 disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Prev
              </button>

              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(totalPages, p + 1)
                  )
                }
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
  const [selectedContest, setSelectedContest] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [contestsLoading, setContestsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadContests() {
      try {
        const data = await contestService.getContests({
          status: "ended",
        });

        if (cancelled) return;

        setContests(data.contests || []);

        if (data.contests?.length > 0 && !selectedContest) {
          setSelectedContest(data.contests[0]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Couldn't load contests."
          );
        }
      } finally {
        if (!cancelled) setContestsLoading(false);
      }
    }

    loadContests();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedContest) return;

    let cancelled = false;

    async function loadLeaderboard() {
      setLoading(true);
      setError(null);

      try {
        const data =
          await leaderboardService.getContestLeaderboard({
            contestId: selectedContest.contest_id,
            page,
            pageSize: PAGE_SIZE,
            search: searchQuery,
          });

        if (cancelled) return;

        setEntries(data.items);
        setTotal(data.total);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Couldn't load contest leaderboard."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [selectedContest, page, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(search);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE)
  );

  if (contestsLoading) {
    return (
      <div className="mt-16 flex items-center justify-center gap-2 text-slate-500">
        <Loader2 className="animate-spin" size={20} />
        Loading contests...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-16 text-center text-red-400">
        {error}
      </div>
    );
  }

  if (!contests.length) {
    return (
      <div className="mt-16 text-center text-slate-500">
        No completed contests yet.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <select
          value={selectedContest?.contest_id || ""}
          onChange={(e) => {
            const contest = contests.find(
              (c) =>
                c.contest_id.toString() === e.target.value
            );

            setSelectedContest(contest);
            setPage(1);
          }}
          className="w-full sm:w-auto rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {contests.map((contest) => (
            <option
              key={contest.contest_id}
              value={contest.contest_id}
            >
              {contest.title}
            </option>
          ))}
        </select>

        <form
          onSubmit={handleSearch}
          className="flex gap-2 w-full sm:w-auto"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="flex-1 sm:w-64 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition"
          >
            Search
          </button>
        </form>
      </div>

      {loading && (
        <div className="mt-16 flex items-center justify-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" size={20} />
          Loading standings...
        </div>
      )}

      {!loading && error && (
        <div className="mt-16 text-center text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="mt-16 text-center text-slate-500">
          No standings yet.
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <>
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full">
              <thead className="bg-slate-900 text-left text-slate-400">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th>Participant</th>
                  <th>Score</th>
                  <th>Penalty</th>
                  <th>Rating Change</th>
                </tr>
              </thead>

              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.rank}
                    className="border-t border-slate-800 hover:bg-slate-900/60 transition"
                  >
                    <td
                      className={`px-6 py-4 font-semibold ${rankStyle(
                        entry.rank
                      )}`}
                    >
                      {entry.rank}
                    </td>

                    <td className="font-medium">
                      <Link
                        to={`/profile/${entry.userId}`}
                        className="hover:text-indigo-400"
                      >
                        {entry.username}
                      </Link>
                    </td>

                    <td className="text-slate-400">
                      {entry.score}
                    </td>

                    <td className="text-slate-400">
                      {entry.penalty}
                    </td>

                    <td
                      className={
                        entry.newRating > entry.oldRating
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {entry.newRating > entry.oldRating
                        ? "+"
                        : ""}
                      {entry.newRating - entry.oldRating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <span>
              Page {page} of {totalPages} · {total} participants
            </span>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-slate-800 px-3 py-2 hover:border-slate-600 disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(totalPages, p + 1)
                  )
                }
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
