import api from "./api";

async function getAllUsers() {
  const { data } = await api.get("/admin/users");
  return data.users;
}

async function updateUserRole(userId, role) {
  const { data } = await api.put(`/admin/users/${userId}/role`, { role });
  return data;
}

async function deleteUser(userId) {
  const { data } = await api.delete(`/admin/users/${userId}`);
  return data;
}

async function createProblem(problemData) {
  const { data } = await api.post("/problems", problemData);
  return data;
}

async function updateProblem(problemId, updates) {
  const { data } = await api.put(`/admin/problems/${problemId}`, updates);
  return data;
}

async function deleteProblem(problemId) {
  const { data } = await api.delete(`/admin/problems/${problemId}`);
  return data;
}

async function deleteContest(contestId) {
  const { data } = await api.delete(`/admin/contests/${contestId}`);
  return data;
}

async function getAllContests() {
  const { data } = await api.get("/admin/contests");
  return data.contests;
}

const adminService = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  createProblem,
  updateProblem,
  deleteProblem,
  deleteContest,
  getAllContests,
};

export default adminService;
