import api from "./api";
 
// Matches backend/src/routes/leaderboard.routes.js (mounted as /leaderboard)
// GET /leaderboard?search=&page=&limit=  -> { leaderboard: [...] }
//   -> backend/src/controllers/leaderboard.controller.js: getGlobalLeaderboard
//
// GET /leaderboard/:id (contest leaderboard) is NOT active yet on the backend
// (route is commented out, controller just returns "not implemented yet").
// getContestLeaderboard below will 404 until that route is uncommented.
 
const getGlobalLeaderboard = ({ search = "", page = 1, limit = 20 } = {}) =>
  api
    .get("/leaderboard", { params: { search, page, limit } })
    .then((res) => res.data);
 
const getContestLeaderboard = (contestId) =>
  api.get(`/leaderboard/${contestId}`).then((res) => res.data);
 
export default { getGlobalLeaderboard, getContestLeaderboard };