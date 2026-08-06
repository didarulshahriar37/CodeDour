import api from "./api";
 
async function getProblems(params = {}) {
  const { data } = await api.get("/problems", { params });
  return data;
}
 
async function getProblemById(id) {
  const { data } = await api.get(`/problems/${id}`);
  return data;
}
 
async function getProblemStats(id) {
  const { data } = await api.get(`/problems/${id}/stats`);
  return data;
}
 
async function getRecommendedProblems() {
  const { data } = await api.get("/problems/recommended");
  return data;
}

async function getRecommendations(problemId) {
  const { data } = await api.get(`/problems/${problemId}/recommendations`);
  return data;
}
 
async function getProblemCategories() {
  const { data } = await api.get("/problems/categories");
  return data;
}
 
const problemService = {
  getProblems,
  getProblemById,
  getProblemStats,
  getRecommendedProblems,
  getRecommendations,
  getProblemCategories,
};
 
export default problemService;
export {
  getProblems,
  getProblemById,
  getProblemStats,
  getRecommendedProblems,
  getRecommendations,
  getProblemCategories,
};
 