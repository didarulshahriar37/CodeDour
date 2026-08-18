CREATE OR REPLACE FUNCTION update_contest_ratings(p_contest_id INT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
    v_total_participants INT;
    v_rating_change INT;
    v_new_rating INT;
BEGIN
    SELECT COUNT(*) INTO v_total_participants 
    FROM contest_participants 
    WHERE contest_id = p_contest_id;

    IF v_total_participants = 0 THEN
        RETURN;
    END IF;

    WITH ranked_participants AS (
        SELECT 
            cp.user_id,
            DENSE_RANK() OVER (ORDER BY cp.score DESC, cp.penalty ASC) as calc_rank
        FROM contest_participants cp
        WHERE cp.contest_id = p_contest_id
    )
    UPDATE contest_participants cp
    SET rank = rp.calc_rank
    FROM ranked_participants rp
    WHERE cp.contest_id = p_contest_id AND cp.user_id = rp.user_id;

    