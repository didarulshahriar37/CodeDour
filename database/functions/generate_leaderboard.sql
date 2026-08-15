CREATE OR REPLACE FUNCTION generate_leaderboard(p_contest_id INT)
RETURNS TABLE (
    rank BIGINT,
    user_id INT,
    username VARCHAR(50),
    display_name VARCHAR(100),
    avatar_url TEXT,
    score INT,
    penalty INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DENSE_RANK() OVER (ORDER BY cp.score DESC, cp.penalty ASC) AS rank,
        cp.user_id,
        u.username,
        u.display_name,
        u.avatar_url,
        cp.score,
        cp.penalty
    FROM contest_participants cp
    JOIN users u ON cp.user_id = u.user_id
    WHERE cp.contest_id = p_contest_id
    ORDER BY cp.score DESC, cp.penalty ASC;
END;
$$;
