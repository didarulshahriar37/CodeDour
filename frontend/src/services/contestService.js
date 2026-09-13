import api from "./api";
 
async function getContests(status) {
  const { data } = await api.get("/contests", {
    params: { status },
  });
  return data;
}
 
async function getContestById(id) {
  const { data } = await api.get(`/contests/${id}`);
  return data;
}
 
async function registerForContest(id) {
  const { data } = await api.post(`/contests/${id}/join`);
  return data;
}
 
async function createContest(contest) {
  const { data } = await api.post("/contests", contest);
  return data;
}
 
async function leaveContest(id) {
  const { data } = await api.delete(`/contests/${id}/join`);
  return data;
}
 
async function addProblemsToContest(id, problems) {
  const { data } = await api.post(`/contests/${id}/problems`, {
    problems,
  });
  return data;
}
 
async function closeContest(id) {
  const { data } = await api.post(`/contests/${id}/close`);
  return data;
}
 
async function recalculateContestRatings(id) {
  const { data } = await api.post(
    `/contests/${id}/recalculate-ratings`
  );
  return data;
}

async function getContestParticipants(id) {
  const { data } = await api.get(`/contests/${id}/participants`);
  return data.participants;
}
 
const contestService = {
  getContests,
  getContestById,
  registerForContest,
  createContest,
  leaveContest,
  addProblemsToContest,
  closeContest,
  recalculateContestRatings,
  getContestParticipants,
};
 
export default contestService;
 
export {
  getContests,
  getContestById,
  registerForContest,
  createContest,
  leaveContest,
  addProblemsToContest,
  closeContest,
  recalculateContestRatings,
  getContestParticipants,
};