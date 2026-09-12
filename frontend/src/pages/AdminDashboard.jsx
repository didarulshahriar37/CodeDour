import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  Code2,
  ShieldAlert,
  Search,
  Trash2,
  Plus,
  Edit3,
  X,
  Loader2,
  Lock,
  ArrowLeft,
  Trophy,
  Calendar,
  Clock,
} from "lucide-react";
import adminService from "../services/adminService";
import problemService from "../services/problemService";
import api from "../services/api";

export default function AdminDashboard() {
  const { profile, isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab === "contests" ? "contests" : "users"
  );

  useEffect(() => {
    document.title = "Admin Dashboard | CodeDour";
  }, []);

  if (!authLoading && (!isAuthenticated || profile?.role !== "admin")) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-950 px-6 text-center text-white">
        <ShieldAlert className="h-16 w-16 text-red-400 mb-4" />

        <h1 className="text-2xl font-bold">Access Denied</h1>

        <p className="mt-2 text-slate-400">
          You must be logged in as an Admin to access this page.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-400"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex w-full flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-900/40 p-6 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-800/80 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white shadow-lg">
              <Lock size={18} />
            </div>

            <div>
              <h2 className="text-base font-bold text-white">
                Admin Control
              </h2>

              <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Administrator
              </span>
            </div>
          </div>

          <nav className="space-y-2">
            {/* Users */}
            <button
              onClick={() => setActiveTab("users")}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold whitespace-nowrap transition ${
                activeTab === "users"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Users size={18} />
              User Management
            </button>

            {/* Problems */}
            <button
              onClick={() => setActiveTab("problems")}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold whitespace-nowrap transition ${
                activeTab === "problems"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Code2 size={18} />
              Problems Management
            </button>

            {/* Contests */}
            <button
              onClick={() => setActiveTab("contests")}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold whitespace-nowrap transition ${
                activeTab === "contests"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Trophy size={18} />
              Contest Management
            </button>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-6 lg:p-8">
          {activeTab === "users" && <UserManagement />}

          {activeTab === "problems" && <ProblemsManagement />}

          {activeTab === "contests" && <ContestManagement />}
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   USER MANAGEMENT
========================================================= */

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionMessage, setActionMessage] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const data = await adminService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";

    try {
      await adminService.updateUserRole(userId, newRole);

      setActionMessage(`User role updated to ${newRole}`);

      setTimeout(() => setActionMessage(null), 3000);

      fetchUsers();
    } catch (err) {
      alert(err.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user @${username}?`
      )
    ) {
      return;
    }

    try {
      await adminService.deleteUser(userId);

      setActionMessage(`User @${username} deleted`);

      setTimeout(() => setActionMessage(null), 3000);

      fetchUsers();
    } catch (err) {
      alert(err.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            User Management
          </h1>

          <p className="text-sm text-slate-400">
            View and manage user accounts and administrator permissions.
          </p>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            size={16}
          />

          <input
            type="text"
            placeholder="Search users by name/email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {actionMessage && (
        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-500 flex justify-center items-center gap-2">
          <Loader2
            className="animate-spin text-indigo-400"
            size={24}
          />
          Loading users...
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">
                    Solved / Submissions
                  </th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.user_id}
                    className="hover:bg-slate-800/40 transition"
                  >
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white text-xs">
                          {(
                            user.display_name ||
                            user.username ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-bold text-white">
                            {user.display_name || user.username}
                          </p>

                          <p className="text-xs text-slate-400">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {user.email}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          user.role === "admin"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      <span className="text-green-400 font-semibold">
                        {user.problems_solved || 0}
                      </span>{" "}
                      / {user.total_submissions || 0}
                    </td>

                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {user.created_at
                        ? new Date(
                            user.created_at
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleRoleToggle(
                              user.user_id,
                              user.role
                            )
                          }
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition border ${
                            user.role === "admin"
                              ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                              : "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                          }`}
                          title={
                            user.role === "admin"
                              ? "Demote to User"
                              : "Promote to Admin"
                          }
                        >
                          {user.role === "admin"
                            ? "Make User"
                            : "Make Admin"}
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteUser(
                              user.user_id,
                              user.username
                            )
                          }
                          className="rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PROBLEMS MANAGEMENT
========================================================= */

function ProblemsManagement() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionMessage, setActionMessage] = useState(null);

  const [allTags, setAllTags] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);

  const [formData, setFormData] = useState({
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
      {
        input: "",
        expected_output: "",
        is_sample: true,
        explanation: "",
      },
    ],
  });

  const fetchProblems = async () => {
    setLoading(true);

    try {
      const data = await problemService.getProblems({
        limit: 100,
      });

      setProblems(data.problems || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();

    api
      .get("/tags")
      .then((res) => setAllTags(res.data.tags || []))
      .catch((err) =>
        console.error("Failed to fetch tags:", err)
      );
  }, []);

  const openCreateModal = () => {
    setEditingProblem(null);

    setFormData({
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
        {
          input: "",
          expected_output: "",
          is_sample: true,
          explanation: "",
        },
      ],
    });

    setModalOpen(true);
  };

  const openEditModal = async (prob) => {
    setEditingProblem(prob);

    const selectedTagIds = Array.isArray(prob.tags)
      ? allTags
          .filter((t) => prob.tags.includes(t.name))
          .map((t) => t.tag_id)
      : [];

    setFormData({
      title: prob.title || "",
      slug: prob.slug || "",
      difficulty: prob.difficulty || "Easy",
      description: prob.description || "",
      input_format: prob.input_format || "",
      output_format: prob.output_format || "",
      constraints: prob.constraints || "",
      time_limit: prob.time_limit || 1.0,
      memory_limit: prob.memory_limit || 256,
      tags: selectedTagIds,
      test_cases: [
        {
          input: "",
          expected_output: "",
          is_sample: true,
          explanation: "",
        },
      ],
    });

    setModalOpen(true);

    try {
      const fullData = await problemService.getProblemById(
        prob.problem_id
      );

      if (fullData) {
        setFormData((prev) => ({
          ...prev,
          title: fullData.title || prev.title,
          slug: fullData.slug || prev.slug,
          difficulty:
            fullData.difficulty || prev.difficulty,
          description: fullData.description || "",
          input_format: fullData.input_format || "",
          output_format: fullData.output_format || "",
          constraints: fullData.constraints || "",
          time_limit:
            fullData.time_limit || prev.time_limit,
          memory_limit:
            fullData.memory_limit || prev.memory_limit,
          test_cases:
            fullData.test_cases?.length > 0
              ? fullData.test_cases
              : prev.test_cases,
        }));
      }
    } catch (err) {
      console.error("Failed to load full problem:", err);
    }
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

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        test_cases: updated,
      };
    });
  };

  const removeTestCase = (index) => {
    setFormData((prev) => ({
      ...prev,
      test_cases: prev.test_cases.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingProblem) {
        await adminService.updateProblem(
          editingProblem.problem_id,
          formData
        );

        setActionMessage(
          "Problem updated successfully"
        );
      } else {
        const slug =
          formData.slug ||
          formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");

        await adminService.createProblem({
          ...formData,
          slug,
        });

        setActionMessage(
          "Problem created successfully"
        );
      }

      setModalOpen(false);

      setTimeout(
        () => setActionMessage(null),
        3000
      );

      fetchProblems();
    } catch (err) {
      alert(
        err.message ||
          "Failed to save problem"
      );
    }
  };

  const handleDeleteProblem = async (
    problemId,
    title
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to delete problem "${title}"?`
      )
    ) {
      return;
    }

    try {
      await adminService.deleteProblem(problemId);

      setActionMessage(
        `Problem "${title}" deleted`
      );

      setTimeout(
        () => setActionMessage(null),
        3000
      );

      fetchProblems();
    } catch (err) {
      alert(
        err.message ||
          "Failed to delete problem"
      );
    }
  };

  const filteredProblems = problems.filter(
    (p) =>
      p.title
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      p.slug
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Problems Management
          </h1>

          <p className="text-sm text-slate-400">
            Create, edit, and organize coding problems.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />

            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full sm:w-64 rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
          >
            <Plus size={16} />
            Add Problem
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-500 flex justify-center items-center gap-2">
          <Loader2
            className="animate-spin text-indigo-400"
            size={24}
          />
          Loading problems...
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Solved By</th>
                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {filteredProblems.map((prob) => (
                  <tr
                    key={prob.problem_id}
                    className="hover:bg-slate-800/40 transition"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      #{prob.problem_id}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      <Link
                        to={`/problems/${prob.problem_id}`}
                        className="hover:text-indigo-400 transition"
                      >
                        {prob.title}
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          prob.difficulty === "Easy"
                            ? "border-green-400/30 bg-green-400/10 text-green-400"
                            : prob.difficulty ===
                              "Medium"
                            ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-400"
                            : "border-red-400/30 bg-red-400/10 text-red-400"
                        }`}
                      >
                        {prob.difficulty}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {prob.solved_by_count ?? 0} users
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            openEditModal(prob)
                          }
                          className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 transition"
                          title="Edit Problem"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteProblem(
                              prob.problem_id,
                              prob.title
                            )
                          }
                          className="rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition"
                          title="Delete Problem"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Problem Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-auto overflow-hidden"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0">
              <h3 className="text-xl font-bold text-white">
                {editingProblem
                  ? "Edit Problem"
                  : "Add New Problem"}
              </h3>

              <button
                onClick={() =>
                  setModalOpen(false)
                }
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleFormSubmit}
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
                        setFormData({
                          ...formData,
                          title: e.target.value,
                        })
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
                          difficulty:
                            e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    >
                      <option value="Easy">
                        Easy
                      </option>
                      <option value="Medium">
                        Medium
                      </option>
                      <option value="Hard">
                        Hard
                      </option>
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
                        description:
                          e.target.value,
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
                          input_format:
                            e.target.value,
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
                      value={
                        formData.output_format
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          output_format:
                            e.target.value,
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
                          time_limit:
                            parseFloat(
                              e.target.value
                            ) || 1.0,
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
                      value={
                        formData.memory_limit
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          memory_limit:
                            parseInt(
                              e.target.value,
                              10
                            ) || 256,
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
                        constraints:
                          e.target.value,
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
                        const isSelected =
                          formData.tags.includes(
                            tag.tag_id
                          );

                        return (
                          <button
                            type="button"
                            key={tag.tag_id}
                            onClick={() => {
                              const newTags =
                                isSelected
                                  ? formData.tags.filter(
                                      (id) =>
                                        id !==
                                        tag.tag_id
                                    )
                                  : [
                                      ...formData.tags,
                                      tag.tag_id,
                                    ];

                              setFormData({
                                ...formData,
                                tags: newTags,
                              });
                            }}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition border ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                                : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                            }`}
                          >
                            {isSelected
                              ? "✓ "
                              : "+ "}
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
                      {formData.test_cases?.length ||
                        0}
                      )
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
                    {formData.test_cases?.map(
                      (tc, index) => (
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

                            {formData.test_cases
                              .length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeTestCase(
                                    index
                                  )
                                }
                                className="text-slate-500 hover:text-red-400 p-1 transition"
                                title="Delete Test Case"
                              >
                                <Trash2
                                  size={15}
                                />
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
                                value={
                                  tc.expected_output
                                }
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
                                value={
                                  tc.explanation ||
                                  ""
                                }
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
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-4 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setModalOpen(false)
                  }
                  className="rounded-xl border border-slate-800 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                >
                  {editingProblem
                    ? "Save Changes"
                    : "Create Problem"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CONTEST MANAGEMENT
========================================================= */

function ContestManagement() {
  const [problems, setProblems] = useState([]);
  const [problemsLoading, setProblemsLoading] =
    useState(true);

  const [creating, setCreating] = useState(false);

  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    duration_minutes: 120,
    is_published: true,
  });

  const [selectedProblems, setSelectedProblems] =
    useState([]);

  /* -----------------------------------------
     Load available problems
  ----------------------------------------- */

  useEffect(() => {
    const fetchProblems = async () => {
      setProblemsLoading(true);

      try {
        const data =
          await problemService.getProblems({
            limit: 100,
          });

        setProblems(data.problems || []);
      } catch (err) {
        console.error(
          "Failed to fetch problems:",
          err
        );

        setMessage({
          type: "error",
          text: "Failed to load problems.",
        });
      } finally {
        setProblemsLoading(false);
      }
    };

    fetchProblems();
  }, []);

  /* -----------------------------------------
     Form input change
  ----------------------------------------- */

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* -----------------------------------------
     Add problem
  ----------------------------------------- */

  const addProblem = () => {
    setSelectedProblems((prev) => [
      ...prev,
      {
        problem_id: "",
        problem_order: String.fromCharCode(
          65 + prev.length
        ),
        points: 100,
      },
    ]);
  };

  /* -----------------------------------------
     Remove problem
  ----------------------------------------- */

  const removeProblem = (index) => {
    setSelectedProblems((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /* -----------------------------------------
     Change selected problem
  ----------------------------------------- */

  const updateSelectedProblem = (
    index,
    field,
    value
  ) => {
    setSelectedProblems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  /* -----------------------------------------
     Create contest
  ----------------------------------------- */

  const handleCreateContest = async (e) => {
    e.preventDefault();

    setCreating(true);
    setMessage(null);

    try {
      if (!formData.title.trim()) {
        throw new Error(
          "Contest title is required."
        );
      }

      if (
        !formData.start_time ||
        !formData.end_time
      ) {
        throw new Error(
          "Start time and end time are required."
        );
      }

      if (!formData.duration_minutes) {
        throw new Error(
          "Duration is required."
        );
      }

      const startDate = new Date(
        formData.start_time
      );

      const endDate = new Date(
        formData.end_time
      );

      if (endDate <= startDate) {
        throw new Error(
          "End time must be after start time."
        );
      }

      /* Make sure every selected problem is valid */
      const invalidProblem =
        selectedProblems.some(
          (problem) =>
            !problem.problem_id
        );

      if (invalidProblem) {
        throw new Error(
          "Please select a problem for every problem row."
        );
      }

      /* Convert selected problems to backend format */
      const contestProblems =
        selectedProblems.map(
          (problem, index) => ({
            problem_id: Number(
              problem.problem_id
            ),
            problem_order:
              problem.problem_order ||
              String.fromCharCode(
                65 + index
              ),
            points:
              Number(problem.points) || 100,
          })
        );

      /* Exact payload expected by backend */
      const payload = {
        title: formData.title.trim(),
        description:
          formData.description.trim(),
        start_time:
          startDate.toISOString(),
        end_time:
          endDate.toISOString(),
        duration_minutes: Number(
          formData.duration_minutes
        ),
        is_published:
          formData.is_published,
        problems: contestProblems,
      };

      console.log(
        "CREATE CONTEST PAYLOAD:",
        payload
      );

      const response = await api.post(
        "/contests",
        payload
      );

      console.log(
        "CREATE CONTEST RESPONSE:",
        response.data
      );

      setMessage({
        type: "success",
        text: "Contest created successfully!",
      });

      /* Reset form */
      setFormData({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        duration_minutes: 120,
        is_published: true,
      });

      setSelectedProblems([]);
    } catch (err) {
      console.error(
        "CREATE CONTEST ERROR:",
        err
      );

      setMessage({
        type: "error",
        text:
          err?.message ||
          err?.details?.error ||
          "Failed to create contest.",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Trophy
              size={22}
              className="text-indigo-400"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Contest Management
            </h1>

            <p className="text-sm text-slate-400">
              Create a new programming contest.
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-5 rounded-xl border px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Contest Form */}
      <form
        onSubmit={handleCreateContest}
        className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6"
      >
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Contest Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Weekly Contest #1"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Description
            </label>

            <textarea
              name="description"
              value={
                formData.description
              }
              onChange={handleChange}
              rows={4}
              placeholder="Describe the contest..."
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
            />
          </div>

          {/* Date / Time */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Calendar size={14} />
                Start Time
              </label>

              <input
                type="datetime-local"
                name="start_time"
                value={
                  formData.start_time
                }
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Calendar size={14} />
                End Time
              </label>

              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="max-w-sm">
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Clock size={14} />
              Duration (minutes)
            </label>

            <input
              type="number"
              name="duration_minutes"
              value={
                formData.duration_minutes
              }
              onChange={handleChange}
              min="1"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Example: 120 = 2 hours
            </p>
          </div>

          {/* Publish */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_published"
                checked={
                  formData.is_published
                }
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />

              <div>
                <p className="text-sm font-semibold text-white">
                  Publish contest immediately
                </p>

                <p className="text-xs text-slate-500">
                  Published contests will appear on
                  the public Contests page.
                </p>
              </div>
            </label>
          </div>

          {/* Problems */}
          <div className="border-t border-slate-800 pt-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Contest Problems
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Select existing problems and assign
                  their order and points.
                </p>
              </div>

              <button
                type="button"
                onClick={addProblem}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-400 transition hover:bg-indigo-500/20"
              >
                <Plus size={16} />
                Add Problem
              </button>
            </div>

            {problemsLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950 py-10 text-sm text-slate-500">
                <Loader2
                  size={20}
                  className="mr-2 animate-spin text-indigo-400"
                />
                Loading problems...
              </div>
            ) : problems.length === 0 ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-6 text-center">
                <p className="text-sm font-medium text-amber-400">
                  No problems available.
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Create at least one problem before
                  creating a contest.
                </p>
              </div>
            ) : selectedProblems.length ===
              0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 px-4 py-8 text-center">
                <Code2
                  size={28}
                  className="mx-auto mb-2 text-slate-600"
                />

                <p className="text-sm text-slate-400">
                  No problems added yet.
                </p>

                <button
                  type="button"
                  onClick={addProblem}
                  className="mt-3 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  + Add the first problem
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedProblems.map(
                  (problem, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <div className="grid gap-4 md:grid-cols-12">
                        {/* Problem */}
                        <div className="md:col-span-6">
                          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Problem
                          </label>

                          <select
                            value={
                              problem.problem_id
                            }
                            onChange={(e) =>
                              updateSelectedProblem(
                                index,
                                "problem_id",
                                e.target.value
                              )
                            }
                            required
                            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                          >
                            <option value="">
                              Select a problem
                            </option>

                            {problems.map(
                              (p) => (
                                <option
                                  key={
                                    p.problem_id
                                  }
                                  value={
                                    p.problem_id
                                  }
                                >
                                  #{p.problem_id} —{" "}
                                  {p.title} (
                                  {p.difficulty})
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* Order */}
                        <div className="md:col-span-2">
                          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Order
                          </label>

                          <input
                            type="text"
                            value={
                              problem.problem_order
                            }
                            onChange={(e) =>
                              updateSelectedProblem(
                                index,
                                "problem_order",
                                e.target.value
                              )
                            }
                            maxLength={3}
                            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Points */}
                        <div className="md:col-span-2">
                          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Points
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={
                              problem.points
                            }
                            onChange={(e) =>
                              updateSelectedProblem(
                                index,
                                "points",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Remove */}
                        <div className="flex items-end md:col-span-2">
                          <button
                            type="button"
                            onClick={() =>
                              removeProblem(
                                index
                              )
                            }
                            className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <Trash2
                                size={15}
                              />
                              Remove
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end border-t border-slate-800 pt-6">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex min-w-48 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Creating Contest...
                </>
              ) : (
                <>
                  <Trophy size={17} />
                  Create Contest
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
