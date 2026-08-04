import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Clock3,
  Users,
  Trophy,
  CheckCircle2,
  Circle,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import contestService from "../services/contestService";
 
const difficultyColor = (difficulty) => {
  switch (difficulty) {
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
 
const statusBadge = {
  running: { label: "LIVE NOW", className: "bg-red-500 text-white" },
  upcoming: { label: "UPCOMING", className: "bg-indigo-500 text-white" },
  past: { label: "ENDED", className: "bg-slate-700 text-slate-300" },
};
 
export default function ContestDetail() {
  const { id } = useParams();
 
  const [activeTab, setActiveTab] = useState("problems");
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
 
  useEffect(() => {
    let cancelled = false;
 
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [contestData, problemsData] = await Promise.all([
          contestService.getContestById(id),
          contestService.getContestProblems(id),
        ]);
        if (cancelled) return;
        setContest(contestData);
        setProblems(problemsData);
      } catch (err) {
        if (!cancelled) setError(err.message || "Couldn't load this contest.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
 
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);
 
  // Leaderboard is fetched lazily — only once the tab is opened, since it's
  // a materialized view query that's heavier than the contest/problem lookup.
  useEffect(() => {
    if (activeTab !== "leaderboard" || leaderboard.length) return;
 
    let cancelled = false;
    contestService
      .getContestLeaderboard(id)
      .then((data) => {
        if (!cancelled) setLeaderboard(data);
      })
      .catch(() => {
        // Leaderboard failing shouldn't block the rest of the page.
      });
 
    return () => {
      cancelled = true;
    };
  }, [activeTab, id, leaderboard.length]);
 
  const handleRegister = async () => {
    setRegistering(true);
    try {
      await contestService.registerForContest(id);
      setContest((prev) => ({ ...prev, isRegistered: true }));
    } catch (err) {
      setError(err.message || "Couldn't register for this contest.");
    } finally {
      setRegistering(false);
    }
  };
 
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={18} />
        Loading contest...
      </div>
    );
  }
 
  if (error || !contest) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-950 text-slate-400">
        <AlertCircle size={28} className="text-red-400" />
        <p>{error || "Contest not found."}</p>
        <Link to="/contests" className="text-sm text-indigo-400 hover:text-indigo-300">
          Back to Contests
        </Link>
      </div>
    );
  }
 
  const badge = statusBadge[contest.status] || statusBadge.past;
 
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <div className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <Link
            to="/contests"
            className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <ChevronLeft size={16} />
            Back to Contests
          </Link>
        </div>
      </div>
 
      {/* Hero */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-900/40 to-slate-900 p-8">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
            {badge.label}
          </span>
 
          <h1 className="mt-4 text-3xl font-bold">{contest.title}</h1>
 
          {contest.description && (
            <p className="mt-3 max-w-2xl text-slate-400">{contest.description}</p>
          )}
 
          <div className="mt-6 flex flex-wrap gap-8 text-slate-300">
            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-indigo-400" />
              {contest.duration}
            </div>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-indigo-400" />
              {contest.participants} Participants
            </div>
          </div>
 
          <div className="mt-8">
            {contest.status === "upcoming" && !contest.isRegistered && (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-400 transition disabled:opacity-50"
              >
                {registering ? "Registering..." : "Register"}
              </button>
            )}
            {contest.status === "upcoming" && contest.isRegistered && (
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                <CheckCircle2 size={16} />
                You're registered
              </span>
            )}
            {contest.status === "running" && (
              <button className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-400 transition">
                Enter Contest
              </button>
            )}
            {contest.status === "past" && (
              <button
                onClick={() => setActiveTab("leaderboard")}
                className="rounded-lg border border-slate-700 px-6 py-3 font-semibold hover:border-slate-500 hover:bg-slate-800/50 transition"
              >
                View Results
              </button>
            )}
          </div>
        </div>
 
        {/* Tabs */}
        <div className="mt-10 flex gap-6 border-b border-slate-800">
          {[
            { id: "problems", label: "Problems", icon: CheckCircle2 },
            { id: "leaderboard", label: "Leaderboard", icon: Trophy },
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
 
        {/* Problems tab */}
        {activeTab === "problems" && (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full">
              <thead className="bg-slate-900 text-left text-slate-400">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th>Problem</th>
                  <th>Difficulty</th>
                  <th>Points</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {problems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      Problems will be visible once the contest starts.
                    </td>
                  </tr>
                )}
                {problems.map((problem) => (
                  <tr
                    key={problem.id}
                    className="border-t border-slate-800 hover:bg-slate-900/60 transition"
                  >
                    <td className="px-6 py-5">
                      {problem.solved ? (
                        <CheckCircle2 className="text-green-400" size={18} />
                      ) : (
                        <Circle className="text-slate-500" size={18} />
                      )}
                    </td>
                    <td className="font-medium">{problem.title}</td>
                    <td className={`font-semibold ${difficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </td>
                    <td className="text-slate-400">{problem.points}</td>
                    <td>
                      <Link
                        to={`/problems/${problem.id}`}
                        className="flex w-fit items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400"
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
        )}
 
        {/* Leaderboard tab */}
        {activeTab === "leaderboard" && (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full">
              <thead className="bg-slate-900 text-left text-slate-400">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th>Participant</th>
                  <th>Solved</th>
                  <th>Penalty</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                      No standings yet.
                    </td>
                  </tr>
                )}
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className="border-t border-slate-800 hover:bg-slate-900/60 transition"
                  >
                    <td className="px-6 py-4 font-semibold">
                      {entry.rank <= 3 ? (
                        <span className="flex items-center gap-1.5 text-yellow-400">
                          <Trophy size={15} />
                          {entry.rank}
                        </span>
                      ) : (
                        entry.rank
                      )}
                    </td>
                    <td className="font-medium">{entry.username}</td>
                    <td className="text-slate-400">{entry.solvedCount}</td>
                    <td className="text-slate-400">{entry.penalty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}