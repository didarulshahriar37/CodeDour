import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  CalendarDays,
  Clock3,
  Users,
  Play,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import contestService from "../services/contestService";
import { useAuth } from "../context/AuthContext";

const formatDuration = (minutes) => {
  if (!minutes) return "N/A";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins} Minutes`;
  if (mins === 0) return `${hours} Hours`;

  return `${hours}h ${mins}m`;
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Contests() {
  const { profile } = useAuth();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadContests() {
      setLoading(true);
      setError(null);

      try {
        const data = await contestService.getContests();

        console.log("CONTEST API RESPONSE:", data);

        if (!cancelled) {
          setContests(data.contests || []);
        }
      } catch (err) {
        console.error("CONTEST API ERROR:", err);

        if (!cancelled) {
          setError(err.message || "Couldn't load contests.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadContests();

    return () => {
      cancelled = true;
    };
  }, []);

  const runningContest = contests.find(
    (contest) => contest.status === "running"
  );

  const upcomingContests = contests.filter(
    (contest) => contest.status === "upcoming"
  );

  const pastContests = contests.filter(
    (contest) => contest.status === "ended"
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-400" size={34} />

            <h1 className="text-4xl font-bold">
              Programming Contests
            </h1>
          </div>

          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            Compete with programmers around the world, solve challenging
            problems under time pressure, and improve your ranking.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {loading && (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="mr-2 animate-spin" size={20} />
            Loading contests...
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center gap-2 py-20 text-red-400">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Running Contest */}
            {runningContest && (
              <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-900/40 to-slate-900 p-8">
                <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold">
                  LIVE NOW
                </span>

                <h2 className="mt-4 text-3xl font-bold">
                  {runningContest.title}
                </h2>

                {runningContest.description && (
                  <p className="mt-3 max-w-2xl text-slate-400">
                    {runningContest.description}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-8">
                  <div className="flex items-center gap-2">
                    <Clock3 size={18} className="text-indigo-400" />
                    {formatDuration(runningContest.duration_minutes)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-indigo-400" />
                    {runningContest.participant_count} Participants
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays
                      size={18}
                      className="text-indigo-400"
                    />
                    Ends {formatDate(runningContest.end_time)}{" "}
                    {formatTime(runningContest.end_time)}
                  </div>
                </div>

                <Link
                  to={`/contests/${runningContest.contest_id}`}
                  className="mt-8 flex w-fit items-center gap-2 rounded-lg bg-indigo-500 px-6 py-3 font-semibold transition hover:bg-indigo-400"
                >
                  <Play size={18} />
                  Enter Contest
                </Link>
              </div>
            )}

            {/* Upcoming Contests */}
            <div className="mt-14 mb-4">
              <Link
                to="/contests/hosted"
                className="mr-3 inline-flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
              >
                <Trophy size={16} />
                My Hosted Contests
              </Link>
              <Link
                to="/contests/create"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold transition hover:bg-indigo-400"
              >
                <Plus size={16} />
                Create Contest
              </Link>
            </div>

            <h2 className="mb-6 text-2xl font-bold">Upcoming Contests</h2>

            {upcomingContests.length === 0 ? (
              <p className="text-slate-500">
                No upcoming contests.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {upcomingContests.map((contest) => (
                  <div
                    key={contest.contest_id}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-indigo-500"
                  >
                    <h3 className="text-xl font-semibold">
                      {contest.title}
                    </h3>

                    {profile?.display_name === contest.created_by_name && (
                      <span className="mt-2 inline-flex rounded-full bg-indigo-500/15 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                        Hosted by you
                      </span>
                    )}

                    {contest.description && (
                      <p className="mt-2 text-sm text-slate-500">
                        {contest.description}
                      </p>
                    )}

                    <div className="mt-5 space-y-3 text-slate-400">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={18} />
                        {formatDate(contest.start_time)}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock3 size={18} />
                        {formatDuration(contest.duration_minutes)}
                      </div>

                      <div className="flex items-center gap-2">
                        <Users size={18} />
                        {contest.participant_count} Registered
                      </div>
                    </div>

                    <Link
                      to={`/contests/${contest.contest_id}`}
                      className="mt-6 flex w-fit items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2 font-medium transition hover:bg-indigo-400"
                    >
                      View Details
                      <Play size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Past Contests */}
            <h2 className="mt-14 mb-6 text-2xl font-bold">
              Past Contests
            </h2>

            {pastContests.length === 0 ? (
              <p className="text-slate-500">
                No past contests.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-800">
                <table className="w-full">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        Contest
                      </th>

                      <th className="text-left">
                        Date
                      </th>

                      <th className="text-left">
                        Participants
                      </th>

                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {pastContests.map((contest) => (
                      <tr
                        key={contest.contest_id}
                        className="border-t border-slate-800 transition hover:bg-slate-900"
                      >
                        <td className="px-6 py-5 font-medium">
                          {contest.title}
                        </td>

                        <td className="text-slate-400">
                          {formatDate(contest.end_time)}
                        </td>

                        <td>
                          {contest.participant_count}
                        </td>

                        <td>
                          <Link
                            to={`/contests/${contest.contest_id}`}
                            className="flex w-fit items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 transition hover:bg-slate-800"
                          >
                            View Results
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
