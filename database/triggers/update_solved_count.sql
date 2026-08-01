-- CodeDour Triggers: Update Solved & Submission Counts & User Statistics

CREATE OR REPLACE FUNCTION update_solved_count_trigger()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
    v_already_solved BOOLEAN;
BEGIN
    IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
        
        IF TG_OP = 'INSERT' THEN
            UPDATE users 
            SET total_submissions = total_submissions + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = NEW.user_id;

            UPDATE problems 
            SET total_submissions = total_submissions + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE problem_id = NEW.problem_id;
        END IF;

        IF NEW.status = 'Accepted' AND (TG_OP = 'INSERT' OR OLD.status != 'Accepted') THEN
            
            UPDATE problems 
            SET accepted_submissions = accepted_submissions + 1
            WHERE problem_id = NEW.problem_id;

            SELECT EXISTS (
                SELECT 1 FROM submissions 
                WHERE user_id = NEW.user_id 
                  AND problem_id = NEW.problem_id 
                  AND status = 'Accepted'
                  AND submission_id != NEW.submission_id
            ) INTO v_already_solved;

            IF NOT v_already_solved THEN
                UPDATE users 
                SET problems_solved = problems_solved + 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = NEW.user_id;
            END IF;

            IF NEW.contest_id IS NOT NULL THEN
                UPDATE contest_participants
                SET score = score + COALESCE((
                    SELECT points FROM contest_problems 
                    WHERE contest_id = NEW.contest_id AND problem_id = NEW.problem_id
                ), 100)
                WHERE contest_id = NEW.contest_id AND user_id = NEW.user_id;
            END IF;

        END IF;

        -- Keep user_statistics table synchronized
        INSERT INTO user_statistics (user_id, total_submissions, accepted_solutions, acceptance_rate, solved_problems, current_rating, highest_rating, last_updated)
        SELECT 
            u.user_id,
            u.total_submissions,
            COUNT(CASE WHEN s.status = 'Accepted' THEN 1 END)::int,
            CASE WHEN u.total_submissions > 0 THEN ROUND((COUNT(CASE WHEN s.status = 'Accepted' THEN 1 END)::numeric / u.total_submissions::numeric) * 100, 2) ELSE 0.00 END,
            u.problems_solved,
            u.rating,
            u.max_rating,
            CURRENT_TIMESTAMP
        FROM users u
        LEFT JOIN submissions s ON u.user_id = s.user_id
        WHERE u.user_id = NEW.user_id
        GROUP BY u.user_id, u.total_submissions, u.problems_solved, u.rating, u.max_rating
        ON CONFLICT (user_id) DO UPDATE SET 
            total_submissions = EXCLUDED.total_submissions,
            accepted_solutions = EXCLUDED.accepted_solutions,
            acceptance_rate = EXCLUDED.acceptance_rate,
            solved_problems = EXCLUDED.solved_problems,
            current_rating = EXCLUDED.current_rating,
            highest_rating = EXCLUDED.highest_rating,
            last_updated = CURRENT_TIMESTAMP;

    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_solved_count ON submissions;
CREATE TRIGGER trg_update_solved_count
AFTER INSERT OR UPDATE OF status ON submissions
FOR EACH ROW
EXECUTE FUNCTION update_solved_count_trigger();
