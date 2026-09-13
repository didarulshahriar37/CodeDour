import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Code2,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import contestService from "../services/contestService";
import problemService from "../services/problemService";
import adminService from "../services/adminService";
import api from "../services/api";
 
const emptyProblemForm = {
  title: "",
  slug: "",
  difficulty: "Easy",
  description: "",
  input_format: "",
  output_format: "",
  constraints: "",
  time_limit: 1.0,
  memory_limit: 256,
  tags: [],
  test_cases: [
    { input: "", expected_output: "", is_sample: true, explanation: "" },
  ],
};
 
export default function ManageContestProblems() {
  const { id } = useParams();
  const navigate = useNavigate();
 
  const [contest, setContest] = useState(null);
  const [allProblems, setAllProblems] = useState([]);
  const [existingProblemIds, setExistingProblemIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
 
  // problem_id -> { problem_order, points }
  const [selected, setSelected] = useState({});
  const [saving, setSaving] = useState(false);
 
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [formData, setFormData] = useState(emptyProblemForm);
 
  useEffect(() => {
    document.title = "Add Problems | CodeDour";
    loadData();
    api
      .get("/tags")
      .then((res) => setAllTags(res.data.tags || []))
      .catch((err) => console.error("Failed to fetch tags:", err));
  }, [id]);
 
  async function loadData() {
    setLoading(true);
    setError(null);
 
    try {
      const [contestData, problemsData] = await Promise.all([
        contestService.getContestById(id),
        problemService.getProblems({ limit: 100 }),
      ]);
 
      setContest(contestData.contest);
      setAllProblems(problemsData.problems || []);
      setExistingProblemIds(
        new Set((contestData.problems || []).map((p) => p.problem_id))
      );
    } catch (err) {
      setError(err.message || "Couldn't load problems.");
    } finally {
      setLoading(false);
    }
  }
 
  const nextOrderLabel = () => {
    const count = existingProblemIds.size + Object.keys(selected).length;
    return String.fromCharCode(65 + count);
  };
 
  const toggleSelected = (problem) => {
    setSelected((current) => {
      const next = { ...current };
 
      if (next[problem.problem_id]) {
        delete next[problem.problem_id];
      } else {
        next[problem.problem_id] = {
          problem_order: nextOrderLabel(),
          points: 100,
        };
      }
 
      return next;
    });
  };
 
  const updateSelectedField = (problemId, field, value) => {
    setSelected((current) => ({
      ...current,
      [problemId]: { ...current[problemId], [field]: value },
    }));
  };
 
  const filteredProblems = allProblems.filter(
    (p) =>
      !existingProblemIds.has(p.problem_id) &&
      (p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.slug?.toLowerCase().includes(search.toLowerCase()))
  );
 
  const selectedCount = Object.keys(selected).length;
 
  const handleAddToContest = async () => {
    if (selectedCount === 0) return;
 
    setSaving(true);
    setError(null);
 
    try {
      const problems = Object.entries(selected).map(([problemId, meta]) => ({
        problem_id: Number(problemId),
        problem_order: meta.problem_order,
        points: Number(meta.points) || 100,
      }));
 
      await contestService.addProblemsToContest(id, problems);
 
      navigate(`/contests/${id}`);
    } catch (err) {
      setError(err.message || "Couldn't add problems to the contest.");
    } finally {
      setSaving(false);
    }
  };
 
  // ---- Create-new-problem modal (same shape as Admin > Problems Management) ----
 
  const openCreateModal = () => {
    setFormData(emptyProblemForm);
    setCreateError(null);
    setCreateModalOpen(true);
  };
 
  const addTestCase = () => {
    setFormData((prev) => ({
      ...prev,
      test_cases: [
        ...prev.test_cases,
        {
          input: "",
          expected_output: "",
          is_sample: prev.test_cases.length === 0,
          explanation: "",
        },
      ],
    }));
  };
 
  const updateTestCase = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.test_cases];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, test_cases: updated };
    });
  };
 
  const removeTestCase = (index) => {
    setFormData((prev) => ({
      ...prev,
      test_cases: prev.test_cases.filter((_, i) => i !== index),
    }));
  };
 
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
 
    try {
      const slug =
        formData.slug ||
        formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
 
      const created = await adminService.createProblem({
        ...formData,
        slug,
      });
 
      const newProblem = created.problem || created;
 
      setAllProblems((prev) => [newProblem, ...prev]);
 
      setSelected((current) => ({
        ...current,
        [newProblem.problem_id]: {
          problem_order: nextOrderLabel(),
          points: 100,
        },
      }));
 
      setCreateModalOpen(false);
    } catch (err) {
      setCreateError(err.message || "Failed to create problem");
    } finally {
      setCreating(false);
    }
  };
 
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={18} />
        Loading problems...
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          to={`/contests/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Contest
        </Link>
 
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Add Problems{contest ? ` — ${contest.title}` : ""}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Select from your existing problems, or create a new one.
            </p>
          </div>
 
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
          >
            <Plus size={16} />
            Create New Problem
          </button>
        </div>
 
        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
 
        <div className="mt-6 relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            size={16}
          />
          <input
            type="text"
            placeholder="Search your problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
          />
        </div>
 
        <div className="mt-4 space-y-2">
          {filteredProblems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 px-4 py-10 text-center text-sm text-slate-400">
              <Code2 size={26} className="mx-auto mb-2 text-slate-600" />
              No available problems match your search.
            </div>
          ) : (
            filteredProblems.map((problem) => {
              const isSelected = Boolean(selected[problem.problem_id]);
 
              return (
                <div
                  key={problem.problem_id}
                  className={`rounded-xl border p-4 transition ${
                    isSelected
                      ? "border-indigo-500/50 bg-indigo-500/5"
                      : "border-slate-800 bg-slate-900/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelected(problem)}
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-500"
                    />
 
                    <div className="flex-1">
                      <p className="font-semibold text-white">
                        {problem.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {problem.difficulty}
                      </p>
                    </div>
 
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <div>
                          <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">
                            Order
                          </label>
                          <input
                            value={selected[problem.problem_id].problem_order}
                            onChange={(e) =>
                              updateSelectedField(
                                problem.problem_id,
                                "problem_order",
                                e.target.value
                              )
                            }
                            className="w-14 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
                          />
                        </div>
 
                        <div>
                          <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">
                            Points
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={selected[problem.problem_id].points}
                            onChange={(e) =>
                              updateSelectedField(
                                problem.problem_id,
                                "points",
                                e.target.value
                              )
                            }
                            className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
 
        <div className="mt-8 flex justify-end gap-3 border-t border-slate-800 pt-6">
          <Link
            to={`/contests/${id}`}
            className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            Cancel
          </Link>
          <button
            onClick={handleAddToContest}
            disabled={selectedCount === 0 || saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold transition hover:bg-indigo-400 disabled:opacity-50"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Add {selectedCount > 0 ? `${selectedCount} ` : ""}Problem
            {selectedCount === 1 ? "" : "s"} to Contest
          </button>
        </div>
      </div>
 
      {createModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0">
              <h3 className="text-xl font-bold text-white">
                Create New Problem
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
 
            {createError && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {createError}
              </div>
            )}
 
            <form
              onSubmit={handleCreateSubmit}
              className="flex flex-col min-h-0 flex-1"
            >
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                      placeholder="e.g. Reverse a String"
                    />
                  </div>
 
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          difficulty: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
 
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-white outline-none focus:border-indigo-500"
                    placeholder="Detailed problem statement..."
                  />
                </div>
 
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Input Format
                    </label>
                    <textarea
                      rows={2}
                      value={formData.input_format}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          input_format: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>
 
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Output Format
                    </label>
                    <textarea
                      rows={2}
                      value={formData.output_format}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          output_format: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
 
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Time Limit (seconds)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10.0"
                      required
                      value={formData.time_limit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          time_limit: parseFloat(e.target.value) || 1.0,
                        })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>
 
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                      Memory Limit (MB)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="16"
                      max="1024"
                      required
                      value={formData.memory_limit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          memory_limit: parseInt(e.target.value, 10) || 256,
                        })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
 
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Constraints
                  </label>
                  <input
                    type="text"
                    value={formData.constraints}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        constraints: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-white outline-none focus:border-indigo-500"
                    placeholder="1 <= N <= 10^5"
                  />
                </div>
 
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                    Problem Tags
                  </label>
                  <div className="flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-950 p-3 max-h-40 overflow-y-auto">
                    {allTags.length === 0 ? (
                      <p className="text-xs text-slate-500 py-1">
                        Loading tags...
                      </p>
                    ) : (
                      allTags.map((tag) => {
                        const isTagSelected = formData.tags.includes(
                          tag.tag_id
                        );
 
                        return (
                          <button
                            type="button"
                            key={tag.tag_id}
                            onClick={() => {
                              const newTags = isTagSelected
                                ? formData.tags.filter(
                                    (idVal) => idVal !== tag.tag_id
                                  )
                                : [...formData.tags, tag.tag_id];
 
                              setFormData({ ...formData, tags: newTags });
                            }}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition border ${
                              isTagSelected
                                ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                                : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                            }`}
                          >
                            {isTagSelected ? "✓ " : "+ "}
                            {tag.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
 
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase text-slate-400">
                      Sample & Judge Test Cases (
                      {formData.test_cases?.length || 0})
                    </label>
                    <button
                      type="button"
                      onClick={addTestCase}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                    >
                      <Plus size={14} />
                      Add Test Case
                    </button>
                  </div>
 
                  <div className="space-y-3">
                    {formData.test_cases?.map((tc, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 relative"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                            <input
                              type="checkbox"
                              checked={tc.is_sample}
                              onChange={(e) =>
                                updateTestCase(
                                  index,
                                  "is_sample",
                                  e.target.checked
                                )
                              }
                              className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>
                              Sample Test Case{" "}
                              {tc.is_sample
                                ? "(Visible to users)"
                                : "(Hidden Judge)"}
                            </span>
                          </label>
 
                          {formData.test_cases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTestCase(index)}
                              className="text-slate-500 hover:text-red-400 p-1 transition"
                              title="Delete Test Case"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
 
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Standard Input
                            </span>
                            <textarea
                              rows={2}
                              value={tc.input}
                              onChange={(e) =>
                                updateTestCase(
                                  index,
                                  "input",
                                  e.target.value
                                )
                              }
                              placeholder="Sample input..."
                              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
 
                          <div>
                            <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Expected Output
                            </span>
                            <textarea
                              rows={2}
                              value={tc.expected_output}
                              onChange={(e) =>
                                updateTestCase(
                                  index,
                                  "expected_output",
                                  e.target.value
                                )
                              }
                              placeholder="Expected output..."
                              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                        </div>
 
                        {tc.is_sample && (
                          <div>
                            <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Explanation (Optional)
                            </span>
                            <input
                              type="text"
                              value={tc.explanation || ""}
                              onChange={(e) =>
                                updateTestCase(
                                  index,
                                  "explanation",
                                  e.target.value
                                )
                              }
                              placeholder="Explanation for sample output..."
                              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
 
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  Create & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}