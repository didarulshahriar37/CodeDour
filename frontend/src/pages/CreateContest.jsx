import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, CalendarDays, Clock3, Code2, Loader2, Plus, Trash2, Trophy } from "lucide-react";
import contestService from "../services/contestService";
import problemService from "../services/problemService";

export default function CreateContest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    durationMinutes: 120,
    isPublished: true,
  });
  const [problems, setProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [problemsLoading, setProblemsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Create Contest | CodeDour";

    async function loadProblems() {
      try {
        const data = await problemService.getProblems({ limit: 100 });
        setProblems(data.problems || []);
      } catch (requestError) {
        setError(requestError.message || "Couldn't load problems.");
      } finally {
        setProblemsLoading(false);
      }
    }

    loadProblems();
  }, []);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addProblem = () => {
    setSelectedProblems((current) => [
      ...current,
      { problem_id: "", problem_order: String.fromCharCode(65 + current.length), points: 100 },
    ]);
  };

  const updateProblem = (index, field, value) => {
    setSelectedProblems((current) => current.map((problem, currentIndex) =>
      currentIndex === index ? { ...problem, [field]: value } : problem
    ));
  };

  const startTime = new Date(form.startTime);
  const endTime = new Date(form.endTime);
  const canCreateContest =
    form.title.trim().length > 0 &&
    !Number.isNaN(startTime.getTime()) &&
    !Number.isNaN(endTime.getTime()) &&
    endTime > startTime &&
    selectedProblems.length > 0 &&
    selectedProblems.every((problem) => problem.problem_id);

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

    if (selectedProblems.length === 0) {
      setError("Add at least one problem before creating the contest.");
      return;
    }

    if (selectedProblems.some((problem) => !problem.problem_id)) {
      setError("Choose a problem for every problem row.");
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
        is_published: form.isPublished,
        problems: selectedProblems.map((problem, index) => ({
          problem_id: Number(problem.problem_id),
          problem_order: problem.problem_order || String.fromCharCode(65 + index),
          points: Number(problem.points) || 100,
        })),
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

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <input name="isPublished" type="checkbox" checked={form.isPublished} onChange={updateField} className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-500" />
              <span><span className="block text-sm font-semibold text-white">Publish contest immediately</span><span className="mt-0.5 block text-xs text-slate-500">Published contests will appear on the public Contests page.</span></span>
            </label>

            <section className="border-t border-slate-800 pt-5">
              <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-bold">Contest Problems</h2><p className="mt-1 text-xs text-slate-500">Add at least one existing problem and set its order and points.</p></div><button type="button" onClick={addProblem} disabled={problemsLoading || problems.length === 0} className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={16} /> Add Problem</button></div>
              {problemsLoading ? <div className="flex justify-center py-8 text-sm text-slate-400"><Loader2 size={18} className="mr-2 animate-spin" /> Loading problems...</div> : selectedProblems.length === 0 ? <div className="mt-4 rounded-lg border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400"><Code2 size={26} className="mx-auto mb-2 text-slate-600" />No problems added yet.<button type="button" onClick={addProblem} className="mt-2 block w-full font-semibold text-indigo-400 hover:text-indigo-300">+ Add the first problem</button></div> : <div className="mt-4 space-y-3">{selectedProblems.map((problem, index) => <div key={index} className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 sm:grid-cols-12"><select value={problem.problem_id} onChange={(event) => updateProblem(index, "problem_id", event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm sm:col-span-6"><option value="">Select a problem</option>{problems.map((availableProblem) => <option key={availableProblem.problem_id} value={availableProblem.problem_id} disabled={selectedProblems.some((selectedProblem, selectedIndex) => selectedIndex !== index && String(selectedProblem.problem_id) === String(availableProblem.problem_id))}>#{availableProblem.problem_id} — {availableProblem.title}</option>)}</select><input aria-label="Problem order" value={problem.problem_order} onChange={(event) => updateProblem(index, "problem_order", event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm sm:col-span-2" /><input aria-label="Problem points" type="number" min="1" value={problem.points} onChange={(event) => updateProblem(index, "points", event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm sm:col-span-2" /><button type="button" onClick={() => setSelectedProblems((current) => current.filter((_, currentIndex) => currentIndex !== index))} className="inline-flex items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 sm:col-span-2"><Trash2 size={16} /></button></div>)}</div>}
            </section>

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
