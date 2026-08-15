CREATE OR REPLACE FUNCTION recommend_problems(
    p_user_id INT,
    p_limit INT DEFAULT 5
)
RETURNS TABLE (
    problem_id INT,
    slug VARCHAR(100),
    title VARCHAR(255),
    difficulty VARCHAR(20),
    acceptance_rate NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_rating INT;
    v_target_difficulty VARCHAR(20);
BEGIN
    SELECT rating INTO v_user_rating FROM users WHERE users.user_id = p_user_id;

    IF v_user_rating IS NULL OR v_user_rating < 1400 THEN
        v_target_difficulty := 'Easy';
    ELSIF v_user_rating < 1800 THEN
        v_target_difficulty := 'Medium';
    ELSE
        v_target_difficulty := 'Hard';
    END IF;

    RETURN QUERY
    SELECT 
        v.problem_id,
        v.slug,
        v.title,
        v.difficulty,
        v.acceptance_rate
    FROM problem_stats_view v
    WHERE v.problem_id NOT IN (
        SELECT DISTINCT s.problem_id 
        FROM submissions s 
        WHERE s.user_id = p_user_id AND s.status = 'Accepted'
    )
    ORDER BY 
        CASE WHEN v.difficulty = v_target_difficulty THEN 0 ELSE 1 END,
        v.acceptance_rate DESC
    LIMIT p_limit;
END;
$$;
