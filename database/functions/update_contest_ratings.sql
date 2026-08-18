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

 FOR r IN 
        SELECT cp.user_id, cp.rank, u.rating 
        FROM contest_participants cp
        JOIN users u ON cp.user_id = u.user_id
        WHERE cp.contest_id = p_contest_id
    LOOP
        v_rating_change := (v_total_participants / 2 - r.rank + 1) * 15;
        v_new_rating := GREATEST(100, r.rating + v_rating_change);

        UPDATE contest_participants 
        SET old_rating = r.rating,
            new_rating = v_new_rating
        WHERE contest_id = p_contest_id AND user_id = r.user_id;

        UPDATE users 
        SET rating = v_new_rating,
            max_rating = GREATEST(max_rating, v_new_rating),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = r.user_id;

        UPDATE user_statistics
        SET current_rating = v_new_rating,
            highest_rating = GREATEST(highest_rating, v_new_rating),
            last_updated = CURRENT_TIMESTAMP
        WHERE user_id = r.user_id;

        -- Log into rating history table
        INSERT INTO ratings (user_id, contest_id, old_rating, new_rating, rating_change, recorded_at)
        VALUES (r.user_id, p_contest_id, r.rating, v_new_rating, v_rating_change, CURRENT_TIMESTAMP);
    END LOOP;

    REFRESH MATERIALIZED VIEW CONCURRENTLY contest_leaderboard_matview;
EXCEPTION
    WHEN OTHERS THEN
        REFRESH MATERIALIZED VIEW contest_leaderboard_matview;
END;
$$;
