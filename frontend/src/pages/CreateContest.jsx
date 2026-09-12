import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, CalendarDays, Clock3, Loader2, Trophy } from "lucide-react";
import contestService from "../services/contestService";

export default function CreateContest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    durationMinutes: 120,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Create Contest | CodeDour";
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const start = new Date(form.startTime);
    const end = new Date(form.endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError("Choose a valid start and end time.");
      return;
    }

    if (end <= start) {
      setError("The end time must be after the start time.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await contestService.createContest({
        title: form.title.trim(),
        description: form.description.trim(),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        duration_minutes: Number(form.durationMinutes),
        is_published: true,
        problems: [],
      });

      navigate(`/contests/${data.contest.contest_id}`, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Couldn't create the contest.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          to="/contests"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Contests
        </Link>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-indigo-500/15 p-3 text-indigo-300">
              <Trophy size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-bold">Create Contest</h1>
              <p className="mt-1 text-sm text-slate-400">
                Set the schedule and basic details. You can add problems afterward.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              <AlertCircle className="mt-0.5 shrink-0" size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-300">
                Contest title
              </label>
              <input
                id="title"
                name="title"
                required
                value={form.title}
                onChange={updateField}
                placeholder="e.g. Weekly Contest #1"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-300">
                Description <span className="text-slate-500">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={updateField}
                rows={4}
                placeholder="Tell participants what to expect."
                className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="startTime" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
                  <CalendarDays size={15} /> Start time
                </label>
                <input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  required
                  value={form.startTime}
                  onChange={updateField}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
                  <CalendarDays size={15} /> End time
                </label>
                <input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  required
                  value={form.endTime}
                  onChange={updateField}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="durationMinutes" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
                <Clock3 size={15} /> Duration in minutes
              </label>
              <input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                min="1"
                required
                value={form.durationMinutes}
                onChange={updateField}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
              <Link
                to="/contests"
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold transition hover:bg-indigo-400 disabled:opacity-50"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Create Contest
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
