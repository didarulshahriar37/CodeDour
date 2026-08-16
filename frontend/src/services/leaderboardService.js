import api from "./api";
 
async function getGlobalLeaderboard(params = {}) {
  const { data } = await api.get("/leaderboard", { params });
  const rows = data.leaderboard || [];
 
  const sorted = [...rows].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.problems_solved - a.problems_solved;
  });
 
  const items = sorted.map((row, index) => ({
    rank: index + 1,
    userId: row.user_id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    rating: row.rating,
    maxRating: row.max_rating,
    solvedCount: row.problems_solved,
    totalSubmissions: row.total_submissions,
    accuracyRate: row.accuracy_rate,
  }));
 
  return { items, total: items.length };
}
 
async function getUserRank(username) {
  const { data } = await api.get(`/leaderboard/${username}/rank`);
  return data; // { rank, rating, percentile }
}
 
const leaderboardService = {
  getGlobalLeaderboard,
  getUserRank,
};
 
export default leaderboardService;
export { getGlobalLeaderboard, getUserRank };
 