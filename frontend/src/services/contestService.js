import api from "./api";
 
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
 
async function getContestLeaderboard(id) {
  const { data } = await api.get(`/contests/${id}/leaderboard`);
  return data;
}
 
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