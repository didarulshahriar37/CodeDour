SELECT user_id, username, display_name, avatar_url, role, rating, max_rating, problems_solved, total_submissions, accuracy_rate, global_rank
FROM user_stats_view
ORDER BY rating DESC
LIMIT $1 OFFSET $2;

SELECT contest_id, user_id, username, display_name, avatar_url, score, penalty, calculated_rank, old_rating, new_rating
FROM contest_leaderboard_matview
WHERE contest_id = $1
ORDER BY calculated_rank ASC
LIMIT $2 OFFSET $3;
