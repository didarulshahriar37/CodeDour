import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  CalendarDays,
  Clock3,
  Users,
  Play,
  Plus,
  ChevronDown,
  ChevronUp,
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

function CollapsibleContestSection({
  title,
  latestContest,
  contests,
  expanded,
  onToggle,
  emptyText,
  enteredContestIds,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
      <button
        type="button"
        onClick={onToggle}
        disabled={!latestContest}
        aria-expanded={latestContest ? expanded : undefined}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-800/60 disabled:cursor-default disabled:hover:bg-transparent"
      >
        <div>
          <p className="text-sm font-semibold text-indigo-300">{title}</p>
          {latestContest ? (
            <>
              <h2 className="mt-1 text-lg font-bold">{latestContest.title}</h2>
              <p className="mt-1 text-sm capitalize text-slate-400">
                Latest contest · {latestContest.status} · {latestContest.participant_count} participants
              </p>
              {title === "Upcoming Contests" && enteredContestIds.has(latestContest.contest_id) && (
                <span className="mt-2 inline-flex rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300">
                  Entered
                </span>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">{emptyText}</p>
          )}
        </div>
        {latestContest && (expanded ? <ChevronUp className="shrink-0 text-indigo-300" /> : <ChevronDown className="shrink-0 text-indigo-300" />)}
      </button>

      {expanded && latestContest && (
        <div className="border-t border-slate-800 p-4">
          <div className="space-y-3">
            {contests.map((contest) => (
              <article key={contest.contest_id} className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">{contest.title}</h3>
                  <span className="rounded-full bg-indigo-500/15 px-2 py-1 text-xs font-semibold capitalize text-indigo-300">{contest.status}</span>
                </div>
                {title === "Upcoming Contests" && enteredContestIds.has(contest.contest_id) && (
                  <span className="mt-2 inline-flex rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300">
                    Entered
                  </span>
                )}
                <p className="mt-2 text-sm text-slate-400">{formatDate(contest.start_time)} · {contest.participant_count} participants</p>
                <Link to={`/contests/${contest.contest_id}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-300 hover:text-indigo-200">View Details <Play size={14} /></Link>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function Contests() {
  const { profile, firebaseUser } = useAuth();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hostedExpanded, setHostedExpanded] = useState(false);
  const [upcomingExpanded, setUpcomingExpanded] = useState(false);
  const [participatedExpanded, setParticipatedExpanded] = useState(false);

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

  const hostedContests = contests.filter(
    (contest) =>
      profile?.display_name &&
      contest.created_by_name === profile.display_name
  );
  const latestHostedContest = hostedContests[0];
  const enteredContestIds = new Set(
    contests
      .filter(
        (contest) =>
          firebaseUser &&
          window.localStorage.getItem(
            `codedour-entered-contest:${firebaseUser.uid}:${contest.contest_id}`
          ) === "true"
      )
      .map((contest) => contest.contest_id)
  );
  const contestHistory = contests.filter(
    (contest) => contest.status === "ended" && enteredContestIds.has(contest.contest_id)
  );
  const latestHistoryContest = contestHistory[0];

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

            <div className="mt-14 mb-4">
              <Link
                to="/contests/create"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold transition hover:bg-indigo-400"
              >
                <Plus size={16} />
                Create Contest
              </Link>
            </div>

            <div className="mb-14 grid gap-5 lg:grid-cols-3">
              <CollapsibleContestSection
                title="Upcoming Contests"
                latestContest={upcomingContests[0]}
                contests={upcomingContests}
                expanded={upcomingExpanded}
                onToggle={() => setUpcomingExpanded((expanded) => !expanded)}
                emptyText="No upcoming contests."
                enteredContestIds={enteredContestIds}
              />
              <CollapsibleContestSection
                title="My Hosted Contests"
                latestContest={latestHostedContest}
                contests={hostedContests}
                expanded={hostedExpanded}
                onToggle={() => setHostedExpanded((expanded) => !expanded)}
                emptyText="You have not hosted a contest yet."
                enteredContestIds={enteredContestIds}
              />
              <CollapsibleContestSection
                title="My Contest History"
                latestContest={latestHistoryContest}
                contests={contestHistory}
                expanded={participatedExpanded}
                onToggle={() => setParticipatedExpanded((expanded) => !expanded)}
                emptyText="You have not completed a contest yet."
                enteredContestIds={enteredContestIds}
              />
            </div>

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
