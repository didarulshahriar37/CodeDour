DROP MATERIALIZED VIEW IF EXISTS contest_leaderboard_matview;

CREATE MATERIALIZED VIEW contest_leaderboard_matview AS
SELECT 
    cp.contest_id,
    cp.user_id,
    u.username,
    u.display_name,
    u.avatar_url,
    cp.score,
    cp.penalty,
    DENSE_RANK() OVER (
        PARTITION BY cp.contest_id 
        ORDER BY cp.score DESC, cp.penalty ASC
    ) AS calculated_rank,
    cp.old_rating,
    cp.new_rating
FROM contest_participants cp
JOIN users u ON cp.user_id = u.user_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_contest_leaderboard_matview 
ON contest_leaderboard_matview (contest_id, user_id);
