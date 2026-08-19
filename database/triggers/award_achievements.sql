CREATE OR REPLACE FUNCTION award_achievements_trigger()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
    a RECORD;
    v_user_id INT := NEW.user_id;
    v_solved INT := NEW.problems_solved;
BEGIN
    FOR a IN 
        SELECT achievement_id, criteria_type, criteria_value 
        FROM achievements 
        WHERE criteria_type = 'solved_count' AND criteria_value <= v_solved
    LOOP
        INSERT INTO user_achievements (user_id, achievement_id, awarded_at)
        VALUES (v_user_id, a.achievement_id, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END LOOP;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_achievements ON users;
CREATE TRIGGER trg_award_achievements
AFTER UPDATE OF problems_solved ON users
FOR EACH ROW
EXECUTE FUNCTION award_achievements_trigger();