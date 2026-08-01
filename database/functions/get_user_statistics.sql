-- CodeDour Functions: Get User Statistics

DROP FUNCTION IF EXISTS get_user_statistics(INT);

CREATE OR REPLACE FUNCTION get_user_statistics(p_user_id INT)
RETURNS TABLE (
    user_id INT,
    username VARCHAR(50),
    display_name VARCHAR(100),
    rating INT,
    max_rating INT,
    global_rank BIGINT,
    problems_solved INT,
    total_submissions INT,
    accepted_count BIGINT,
    wrong_answer_count BIGINT,
    tle_count BIGINT,
    error_count BIGINT,
    acceptance_rate NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.username,
        u.display_name,
        u.rating,
        u.max_rating,
        v.global_rank,
        u.problems_solved,
        u.total_submissions,
        COUNT(CASE WHEN s.status = 'Accepted' THEN 1 END) AS accepted_count,
        COUNT(CASE WHEN s.status = 'Wrong Answer' THEN 1 END) AS wrong_answer_count,
        COUNT(CASE WHEN s.status = 'Time Limit Exceeded' THEN 1 END) AS tle_count,
        COUNT(CASE WHEN s.status IN ('Compilation Error', 'Runtime Error', 'Memory Limit Exceeded') THEN 1 END) AS error_count,
        COALESCE(us.acceptance_rate, 0.00) AS acceptance_rate
    FROM users u
    LEFT JOIN user_stats_view v ON u.user_id = v.user_id
    LEFT JOIN user_statistics us ON u.user_id = us.user_id
    LEFT JOIN submissions s ON u.user_id = s.user_id
    WHERE u.user_id = p_user_id
    GROUP BY u.user_id, u.username, u.display_name, u.rating, u.max_rating, v.global_rank, u.problems_solved, u.total_submissions, us.acceptance_rate;
END;
$$;
