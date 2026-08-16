import api from "./api";
 
 
const getUserProfile = (userId) =>
  api.get(`/users/${userId}`).then((res) => res.data.user);
 
const getUserStats = (userId) =>
  api.get(`/users/${userId}/stats`).then((res) => res.data.stats);
 
const getUserSubmissions = (userId, { page = 1, limit = 20 } = {}) =>
  api
    .get(`/users/${userId}/submissions`, { params: { page, limit } })
    .then((res) => res.data.submissions);
 
export default { getUserProfile, getUserStats, getUserSubmissions };
 