import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, CalendarDays, Clock3, Loader2, Trophy } from "lucide-react";
import contestService from "../services/contestService";
 
function DateTimeField({ id, name, label, hint, value, onChange, min, hasError }) {
  const inputRef = useRef(null);
 
  const openPicker = () => {
    const input = inputRef.current;
    if (input && typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {
        input.focus();
      }
    } else if (input) {
      input.focus();
    }
  };
 
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </label>
      <div
        onClick={openPicker}
        className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-slate-950 px-3 py-2.5 transition focus-within:border-indigo-500 ${
          hasError ? "border-red-500/60" : "border-slate-700"
        }`}
      >
        <CalendarDays size={16} className="shrink-0 text-slate-500" />
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="datetime-local"
          required
          min={min}
          value={value}
          onChange={onChange}
          onClick={openPicker}
          className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
        />
      </div>
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}
 
function formatDuration(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
 
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
 
  const diffMs = end.getTime() - start.getTime();
 
  if (diffMs <= 0) {
    return null;
  }
 
  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
 
  if (hours === 0) {
    return `${minutes}m`;
  }
 
  if (minutes === 0) {
    return `${hours}h`;
  }
 
  return `${hours}h ${minutes}m`;
}
 
export default function CreateContest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    isPublished: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    document.title = "Create Contest | CodeDour";
  }, []);
 
  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
 
  const startTime = new Date(form.startTime);
  const endTime = new Date(form.endTime);
  const duration = formatDuration(form.startTime, form.endTime);
  const endBeforeStart =
    form.startTime &&
    form.endTime &&
    !Number.isNaN(startTime.getTime()) &&
    !Number.isNaN(endTime.getTime()) &&
    endTime <= startTime;
 
  const canCreateContest =
    form.title.trim().length > 0 &&
    !Number.isNaN(startTime.getTime()) &&
    !Number.isNaN(endTime.getTime()) &&
    endTime > startTime;
 
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
      const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
 
      const data = await contestService.createContest({
        title: form.title.trim(),
        description: form.description.trim(),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        duration_minutes: durationMinutes,
        is_published: form.isPublished,
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
 
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-200">
                <CalendarDays size={16} className="text-indigo-300" />
                Contest schedule
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Pick when the contest opens and when it closes for submissions.
              </p>
 
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <DateTimeField
                  id="startTime"
                  name="startTime"
                  label="Starts at"
                  hint="Contest becomes active from this moment."
                  value={form.startTime}
                  onChange={updateField}
                />
 
                <DateTimeField
                  id="endTime"
                  name="endTime"
                  label="Ends at"
                  hint="Submissions stop being accepted after this time."
                  value={form.endTime}
                  onChange={updateField}
                  min={form.startTime || undefined}
                  hasError={endBeforeStart}
                />
              </div>
 
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm">
                <Clock3 size={15} className="text-indigo-300 shrink-0" />
                {endBeforeStart ? (
                  <span className="text-red-300">End time must be after the start time.</span>
                ) : duration ? (
                  <span className="text-slate-300">
                    Contest will run for <span className="font-semibold text-white">{duration}</span>
                  </span>
                ) : (
                  <span className="text-slate-500">Pick both times to see the contest duration.</span>
                )}
              </div>
            </div>
 
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <input
                name="isPublished"
                type="checkbox"
                checked={form.isPublished}
                onChange={updateField}
                className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-500"
              />
              <span>
                <span className="block text-sm font-semibold text-white">Publish contest immediately</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Published contests will appear on the public Contests page.
                </span>
              </span>
            </label>
 
            <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
              <Link
                to="/contests"
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !canCreateContest}
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