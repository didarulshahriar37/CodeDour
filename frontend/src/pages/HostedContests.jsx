import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Loader2, Play, Trophy, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import contestService from "../services/contestService";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date unavailable";

export default function HostedContests() {
  const { profile } = useAuth();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHostedContests() {
      try {
        const data = await contestService.getContests();
        if (!cancelled) {
          setContests(
            (data.contests || []).filter(
              (contest) =>
                profile?.display_name &&
                contest.created_by_name === profile.display_name
            )
          );
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message || "Couldn't load your contests.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHostedContests();
    return () => { cancelled = true; };
  }, [profile?.display_name]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link to="/contests" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-white">
          <ArrowLeft size={16} /> Back to Contests
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <span className="rounded-xl bg-indigo-500/15 p-3 text-indigo-300"><Trophy size={22} /></span>
          <div>
            <h1 className="text-2xl font-bold">My Hosted Contests</h1>
            <p className="mt-1 text-sm text-slate-400">Contests you have created, including contests that have ended.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-slate-400"><Loader2 size={20} className="mr-2 animate-spin" /> Loading your contests...</div>
        ) : error ? (
          <p className="py-20 text-center text-red-400">{error}</p>
        ) : contests.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-700 px-6 py-14 text-center text-slate-400">You have not created any published contests yet.</div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {contests.map((contest) => (
              <article key={contest.contest_id} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-start justify-between gap-3"><h2 className="text-xl font-semibold">{contest.title}</h2><span className="rounded-full bg-indigo-500/15 px-2.5 py-1 text-xs font-semibold capitalize text-indigo-300">{contest.status}</span></div>
                {contest.description && <p className="mt-3 text-sm text-slate-400">{contest.description}</p>}
                <div className="mt-5 space-y-2 text-sm text-slate-400"><p className="flex items-center gap-2"><CalendarDays size={16} /> {formatDate(contest.start_time)}</p><p className="flex items-center gap-2"><Users size={16} /> {contest.participant_count} participants</p></div>
                <Link to={`/contests/${contest.contest_id}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:text-indigo-200">View Details <Play size={15} /></Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
