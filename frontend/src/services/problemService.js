import api from "./api";
 
/**
 * Fetch a paginated, filterable list of problems.
 * params: { search, difficulty, category, page, pageSize, solvedByMe }
 */
async function getProblems(params = {}) {
  const { data } = await api.get("/problems", { params });
  return data; // { items, total, page, pageSize }
}
 
async function getProblemById(id) {
  const { data } = await api.get(`/problems/${id}`);
  return data;
}
 
// Backed by database/views/problem_stats_view.sql
async function getProblemStats(id) {
  const { data } = await api.get(`/problems/${id}/stats`);
  return data;
}
 
// Backed by database/functions/recommend_problems.sql
async function getRecommendedProblems() {
  const { data } = await api.get("/problems/recommended");
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
  getProblemCategories,
};
 
export default problemService;
export {
  getProblems,
  getProblemById,
  getProblemStats,
  getRecommendedProblems,
  getProblemCategories,
};
 