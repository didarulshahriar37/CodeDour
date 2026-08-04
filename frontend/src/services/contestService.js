import api from "./api";
 
/**
 * status: "running" | "upcoming" | "past" | undefined (all)
 * Matches the three sections on the Contests page.
 */
async function getContests(status) {
  const { data } = await api.get("/contests", { params: { status } });
  return data;
}
 
async function getContestById(id) {
  const { data } = await api.get(`/contests/${id}`);
  return data;
}
 
async function registerForContest(id) {
  const { data } = await api.post(`/contests/${id}/register`);
  return data;
}
 
async function unregisterFromContest(id) {
  const { data } = await api.delete(`/contests/${id}/register`);
  return data;
}
 
async function getContestProblems(id) {
  const { data } = await api.get(`/contests/${id}/problems`);
  return data;
}
 
// Backed by database/views/contest_leaderboard_matview.sql
async function getContestLeaderboard(id) {
  const { data } = await api.get(`/contests/${id}/leaderboard`);
  return data;
}
 
// Backed by database/functions/update_contest_ratings.sql (runs server-side
// once a contest ends); this just reads the resulting standings.
async function getContestResults(id) {
  const { data } = await api.get(`/contests/${id}/results`);
  return data;
}
 
const contestService = {
  getContests,
  getContestById,
  registerForContest,
  unregisterFromContest,
  getContestProblems,
  getContestLeaderboard,
  getContestResults,
};
 
export default contestService;
export {
  getContests,
  getContestById,
  registerForContest,
  unregisterFromContest,
  getContestProblems,
  getContestLeaderboard,
  getContestResults,
};