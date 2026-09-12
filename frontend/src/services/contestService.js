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

async function addProblemsToContest(id, problems) {
  const { data } = await api.post(`/contests/${id}/problems`, {
    problems,
  });
  return data;
}

async function recalculateContestRatings(id) {
  const { data } = await api.post(
    `/contests/${id}/recalculate-ratings`
  );
  return data;
}

const contestService = {
  getContests,
  getContestById,
  registerForContest,
  addProblemsToContest,
  recalculateContestRatings,
};

export default contestService;

export {
  getContests,
  getContestById,
  registerForContest,
  addProblemsToContest,
  recalculateContestRatings,
};