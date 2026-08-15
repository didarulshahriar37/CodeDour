import api from "./api";
 
// Matches backend/src/controllers/user.controller.js
//
// GET /users/:id            -> { user: {...} }
//   user_id, username, email, display_name, avatar_url, role, rating,
//   max_rating, problems_solved, total_submissions, created_at
//   NOTE: backend currently returns `email` here too, same as getMyProfile.
//   Frontend never renders it for other users' profiles (see Profile.jsx),
//   but worth tightening the SQL SELECT on the backend to drop `email`
//   for this public endpoint if that's not intentional.
//
// GET /users/:id/stats       -> { stats: {...} }        (get_user_statistics)
// GET /users/:id/submissions -> { submissions: [...] }  (paginated, page/limit)
 
const getUserProfile = (userId) =>
  api.get(`/users/${userId}`).then((res) => res.data.user);
 
const getUserStats = (userId) =>
  api.get(`/users/${userId}/stats`).then((res) => res.data.stats);
 
const getUserSubmissions = (userId, { page = 1, limit = 20 } = {}) =>
  api
    .get(`/users/${userId}/submissions`, { params: { page, limit } })
    .then((res) => res.data.submissions);
 
export default { getUserProfile, getUserStats, getUserSubmissions };
 