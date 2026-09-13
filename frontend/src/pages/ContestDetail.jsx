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
  Lock,
} from "lucide-react";
import contestService from "../services/contestService";
import { useAuth } from "../context/AuthContext";
import submissionService from "../services/submissionService";
import leaderboardService from "../services/leaderboardService";

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
  ended: { label: "ENDED", className: "bg-slate-700 text-slate-300" },
};

const formatDuration = (minutes) => {
  if (!minutes) return "N/A";

  if (minutes < 60) {
    return `${minutes} Minutes`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} Hour${hours > 1 ? "s" : ""}`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

export default function ContestDetail() {
  const { id } = useParams();
  const { firebaseUser } = useAuth();
  const enteredContestKey = firebaseUser
    ? `codedour-entered-contest:${firebaseUser.uid}:${id}`
    : null;

  const [activeTab, setActiveTab] = useState("problems");
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [membershipAction, setMembershipAction] = useState(null);
  const [solvedProblemIds, setSolvedProblemIds] = useState(new Set());
  const [leaderboardEntries, setLeaderboardEntries] = useState(null);
  const [leaderboardError, setLeaderboardError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await contestService.getContestById(id);

        if (cancelled) return;

        const enteredInBrowser =
          enteredContestKey &&
          window.localStorage.getItem(enteredContestKey) === "true";
        setContest({
          ...data.contest,
          is_registered: data.contest.is_registered || enteredInBrowser,
        });
        setProblems(data.problems || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Couldn't load this contest.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, enteredContestKey]);

  useEffect(() => {
    if (!contest?.is_registered || problems.length === 0) return undefined;

    let cancelled = false;

    async function loadSolvedProblems() {
      const results = await Promise.all(
        problems.map(async (problem) => {
          try {
            const data = await submissionService.getSubmissions({
              problemId: problem.problem_id,
              contestId: contest.contest_id,
              status: "accepted",
              pageSize: 100,
            });
            const submissions = data.items || data.submissions || [];
            return submissions.some((submission) => submission.status === "Accepted")
              ? problem.problem_id
              : null;
          } catch {
            return null;
          }
        })
      );

      if (!cancelled) {
        setSolvedProblemIds(new Set(results.filter(Boolean)));
      }
    }

    loadSolvedProblems();

    return () => {
      cancelled = true;
    };
  }, [contest?.contest_id, contest?.is_registered, problems]);

  useEffect(() => {
    if (activeTab !== "leaderboard" || !contest?.contest_id) {
      return undefined;
    }

    let cancelled = false;

    async function loadLeaderboard() {
      try {
        const data = await leaderboardService.getContestLeaderboard({
          contestId: contest.contest_id,
          pageSize: 100,
        });

        if (!cancelled) {
          setLeaderboardEntries(data.items || []);
        }
      } catch (requestError) {
        if (!cancelled) {
          setLeaderboardError(
            requestError.message || "Couldn't load contest standings."
          );
          setLeaderboardEntries([]);
        }
      }
    }

    loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [activeTab, contest?.contest_id]);

  const handleEnter = async () => {
    setMembershipAction("enter");
    setError(null);

    try {
      await contestService.registerForContest(id);

      if (enteredContestKey) {
        window.localStorage.setItem(enteredContestKey, "true");
      }

      setContest((prev) => ({
        ...prev,
        is_registered: true,
        participant_count: Number(prev.participant_count || 0) + 1,
      }));
    } catch (err) {
      setError(err.message || "Couldn't enter this contest.");
    } finally {
      setMembershipAction(null);
    }
  };

  const handleExit = async () => {
    setMembershipAction("exit");
    setError(null);

    try {
      await contestService.leaveContest(id);

      if (enteredContestKey) {
        window.localStorage.removeItem(enteredContestKey);
      }

      setContest((prev) => ({
        ...prev,
        is_registered: false,
        participant_count: Math.max(0, Number(prev.participant_count || 0) - 1),
      }));
    } catch (err) {
      setError(err.message || "Couldn't exit this contest.");
    } finally {
      setMembershipAction(null);
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

        <Link
          to="/contests"
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          Back to Contests
        </Link>
      </div>
    );
  }

  const badge = statusBadge[contest.status] || statusBadge.ended;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
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

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-900/40 to-slate-900 p-8">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
          >
            {badge.label}
          </span>

          <h1 className="mt-4 text-3xl font-bold">{contest.title}</h1>

          {contest.description && (
            <p className="mt-3 max-w-2xl text-slate-400">
              {contest.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-8 text-slate-300">
            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-indigo-400" />
              {formatDuration(contest.duration_minutes)}
            </div>

            <div className="flex items-center gap-2">
              <Users size={18} className="text-indigo-400" />
              {contest.participant_count || 0} Participants
            </div>
          </div>

          <div className="mt-8">
            {contest.status === "upcoming" && !contest.is_registered && (
              <button
                onClick={handleEnter}
                disabled={membershipAction !== null}
                className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold transition hover:bg-indigo-400 disabled:opacity-50"
              >
                {membershipAction === "enter" ? "Entering..." : "Enter Contest"}
              </button>
            )}

            {contest.status === "upcoming" && contest.is_registered && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
                  <CheckCircle2 size={16} />
                  Entered
                </span>
                <button
                  onClick={handleExit}
                  disabled={membershipAction !== null}
                  className="rounded-lg border border-red-500/40 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  {membershipAction === "exit" ? "Exiting..." : "Exit Contest"}
                </button>
              </div>
            )}

            {contest.status === "running" && (
              <button
                onClick={() => setActiveTab("problems")}
                className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold transition hover:bg-indigo-400"
              >
                Enter Contest
              </button>
            )}

            {contest.status === "ended" && (
              <button
                onClick={() => setActiveTab("leaderboard")}
                className="rounded-lg border border-slate-700 px-6 py-3 font-semibold transition hover:border-slate-500 hover:bg-slate-800/50"
              >
                View Results
              </button>
            )}
          </div>
        </div>

        <div className="mt-10 flex gap-6 border-b border-slate-800">
          {[
            {
              id: "problems",
              label: "Problems",
              icon: CheckCircle2,
            },
            {
              id: "leaderboard",
              label: "Leaderboard",
              icon: Trophy,
            },
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

        {activeTab === "problems" && !contest.is_registered && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center">
            <Lock size={28} className="mx-auto mb-3 text-indigo-400" />
            <h2 className="text-lg font-semibold">Enter the contest to unlock problems</h2>
            <p className="mt-2 text-sm text-slate-400">
              You need to enter this contest before you can view or solve its problems.
            </p>
          </div>
        )}

        {activeTab === "problems" && contest.is_registered && (
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
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No problems have been added to this contest yet.
                    </td>
                  </tr>
                )}

                {problems.map((problem) => (
                  <tr
                    key={problem.problem_id}
                    className="border-t border-slate-800 transition hover:bg-slate-900/60"
                  >
                    <td className="px-6 py-5">
                      {solvedProblemIds.has(problem.problem_id) ? (
                        <CheckCircle2 className="text-emerald-400" size={18} />
                      ) : (
                        <Circle className="text-slate-500" size={18} />
                      )}
                    </td>

                    <td className="font-medium">{problem.title}</td>

                    <td
                      className={`font-semibold ${difficultyColor(
                        problem.difficulty
                      )}`}
                    >
                      {problem.difficulty}
                    </td>

                    <td className="text-slate-400">{problem.points}</td>

                    <td>
                      <Link
                        to={`/problems/${problem.problem_id}`}
                        state={{ contestId: contest.contest_id }}
                        className="flex w-fit items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400"
                      >
                        {solvedProblemIds.has(problem.problem_id)
                          ? "Try Again"
                          : "Solve"}
                        <ArrowRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
            {leaderboardEntries === null ? (
              <div className="flex items-center justify-center px-6 py-10 text-sm text-slate-400">
                <Loader2 size={18} className="mr-2 animate-spin" />
                Loading standings...
              </div>
            ) : leaderboardError ? (
              <div className="px-6 py-10 text-center text-sm text-red-400">
                {leaderboardError}
              </div>
            ) : leaderboardEntries.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Trophy size={32} className="mx-auto mb-3 text-yellow-400" />
                <p className="text-slate-400">
                  No contest submissions have been ranked yet.
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-sm text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Penalty</th>
                    <th className="px-6 py-4">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardEntries.map((entry) => (
                    <tr key={entry.userId} className="border-t border-slate-800">
                      <td className="px-6 py-4 font-semibold">#{entry.rank}</td>
                      <td className="px-6 py-4">
                        <Link to={`/profile/${entry.userId}`} className="font-medium hover:text-indigo-300">
                          {entry.displayName || entry.username}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{entry.score}</td>
                      <td className="px-6 py-4 text-slate-400">{entry.penalty}</td>
                      <td className="px-6 py-4 text-slate-400">
                        {entry.newRating ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
