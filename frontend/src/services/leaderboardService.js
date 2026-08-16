import api from "./api";
 
 
const getGlobalLeaderboard = ({ search = "", page = 1, limit = 20 } = {}) =>
  api
    .get("/leaderboard", { params: { search, page, limit } })
    .then((res) => res.data);
 
const getContestLeaderboard = (contestId) =>
  api.get(`/leaderboard/${contestId}`).then((res) => res.data);
 
export default { getGlobalLeaderboard, getContestLeaderboard };