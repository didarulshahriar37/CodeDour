-- ==========================================
-- CodeDour Master Initialization Script
-- ==========================================

-- 1. TABLES DEFINITION
DROP TABLE IF EXISTS user_statistics CASCADE;
DROP TABLE IF EXISTS topic_dependencies CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS contest_participants CASCADE;
DROP TABLE IF EXISTS contest_problems CASCADE;
DROP TABLE IF EXISTS contests CASCADE;
DROP TABLE IF EXISTS test_cases CASCADE;
DROP TABLE IF EXISTS problem_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user',
    rating INT DEFAULT 1500,
    max_rating INT DEFAULT 1500,
    problems_solved INT DEFAULT 0,
    total_submissions INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE problems (
    problem_id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL,
    constraints TEXT NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'Easy',
    time_limit DOUBLE PRECISION DEFAULT 1.0,
    memory_limit INT DEFAULT 256,
    author_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT TRUE,
    total_submissions INT DEFAULT 0,
    accepted_submissions INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE problem_tags (
    problem_id INT REFERENCES problems(problem_id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, tag_id)
);

CREATE TABLE test_cases (
    test_case_id SERIAL PRIMARY KEY,
    problem_id INT REFERENCES problems(problem_id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_sample BOOLEAN DEFAULT FALSE,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contests (
    contest_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contest_problems (
    contest_id INT REFERENCES contests(contest_id) ON DELETE CASCADE,
    problem_id INT REFERENCES problems(problem_id) ON DELETE CASCADE,
    problem_order VARCHAR(5) NOT NULL,
    points INT DEFAULT 100,
    PRIMARY KEY (contest_id, problem_id)
);

CREATE TABLE contest_participants (
    contest_id INT REFERENCES contests(contest_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    score INT DEFAULT 0,
    penalty INT DEFAULT 0,
    rank INT,
    old_rating INT,
    new_rating INT,
    PRIMARY KEY (contest_id, user_id)
);

CREATE TABLE submissions (
    submission_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    problem_id INT REFERENCES problems(problem_id) ON DELETE CASCADE,
    contest_id INT REFERENCES contests(contest_id) ON DELETE SET NULL,
    language VARCHAR(30) NOT NULL,
    language_id INT,
    code TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending',
    execution_time DOUBLE PRECISION,
    memory_used INT,
    token VARCHAR(100),
    error_message TEXT,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE achievements (
    achievement_id SERIAL PRIMARY KEY,
    title VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(255),
    criteria_type VARCHAR(50) NOT NULL,
    criteria_value INT NOT NULL
);

CREATE TABLE user_achievements (
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    achievement_id INT REFERENCES achievements(achievement_id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    contest_id INT REFERENCES contests(contest_id) ON DELETE CASCADE,
    old_rating INT NOT NULL,
    new_rating INT NOT NULL,
    rating_change INT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE topic_dependencies (
    topic_id INT REFERENCES tags(tag_id) ON DELETE CASCADE,
    prerequisite_id INT REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (topic_id, prerequisite_id)
);

CREATE TABLE user_statistics (
    user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    total_submissions INT DEFAULT 0,
    accepted_solutions INT DEFAULT 0,
    acceptance_rate NUMERIC(5,2) DEFAULT 0.00,
    solved_problems INT DEFAULT 0,
    current_rating INT DEFAULT 1500,
    highest_rating INT DEFAULT 1500,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating DESC);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_slug ON problems(slug);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_contest_id ON submissions(contest_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_contest_participants_rank ON contest_participants(contest_id, score DESC, penalty ASC);
CREATE INDEX IF NOT EXISTS idx_test_cases_problem_id ON test_cases(problem_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_contest_id ON ratings(contest_id);
CREATE INDEX IF NOT EXISTS idx_topic_deps ON topic_dependencies(topic_id, prerequisite_id);

-- 3. CONSTRAINTS
ALTER TABLE users 
    ADD CONSTRAINT chk_users_role CHECK (role IN ('user', 'admin', 'setter')),
    ADD CONSTRAINT chk_users_rating CHECK (rating >= 0);

ALTER TABLE problems 
    ADD CONSTRAINT chk_problems_difficulty CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    ADD CONSTRAINT chk_problems_limits CHECK (time_limit > 0 AND memory_limit > 0);

ALTER TABLE contests 
    ADD CONSTRAINT chk_contests_time CHECK (start_time < end_time);

ALTER TABLE submissions 
    ADD CONSTRAINT chk_submissions_status CHECK (status IN (
        'Pending', 'In Queue', 'Processing', 'Accepted', 
        'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 
        'Compilation Error', 'Runtime Error'
    ));

ALTER TABLE topic_dependencies
    ADD CONSTRAINT chk_no_self_prerequisite CHECK (topic_id != prerequisite_id);

-- 4. VIEWS
CREATE OR REPLACE VIEW problem_stats_view AS
SELECT 
    p.problem_id,
    p.slug,
    p.title,
    p.difficulty,
    p.total_submissions,
    p.accepted_submissions,
    CASE 
        WHEN p.total_submissions > 0 THEN 
            ROUND((p.accepted_submissions::numeric / p.total_submissions::numeric) * 100, 2)
        ELSE 0.00 
    END AS acceptance_rate,
    u.username AS author_name,
    p.created_at
FROM problems p
LEFT JOIN users u ON p.author_id = u.user_id;

CREATE OR REPLACE VIEW user_stats_view AS
SELECT 
    u.user_id,
    u.username,
    u.display_name,
    u.avatar_url,
    u.role,
    u.rating,
    u.max_rating,
    u.problems_solved,
    u.total_submissions,
    CASE 
        WHEN u.total_submissions > 0 THEN 
            ROUND((u.problems_solved::numeric / u.total_submissions::numeric) * 100, 2)
        ELSE 0.00 
    END AS accuracy_rate,
    DENSE_RANK() OVER (ORDER BY u.rating DESC) AS global_rank,
    u.created_at
FROM users u;

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

-- 5. FUNCTIONS
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

        INSERT INTO ratings (user_id, contest_id, old_rating, new_rating, rating_change, recorded_at)
        VALUES (r.user_id, p_contest_id, r.rating, v_new_rating, v_rating_change, CURRENT_TIMESTAMP);
    END LOOP;

    REFRESH MATERIALIZED VIEW CONCURRENTLY contest_leaderboard_matview;
EXCEPTION
    WHEN OTHERS THEN
        REFRESH MATERIALIZED VIEW contest_leaderboard_matview;
END;
$$;

-- 6. PROCEDURES
CREATE OR REPLACE PROCEDURE process_submission(
    p_submission_id INT,
    p_status VARCHAR(30),
    p_execution_time DOUBLE PRECISION,
    p_memory_used INT,
    p_error_message TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE submissions
    SET status = p_status,
        execution_time = p_execution_time,
        memory_used = p_memory_used,
        error_message = p_error_message
    WHERE submission_id = p_submission_id;
END;
$$;

-- 7. TRIGGERS
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

-- 8. SEED DATA
INSERT INTO achievements (achievement_id, title, description, icon_url, criteria_type, criteria_value) VALUES
(1, 'First Step', 'Solve your first programming problem', 'trophy-first-step.png', 'solved_count', 1),
(2, 'Problem Solver', 'Solve 5 programming problems', 'trophy-solver.png', 'solved_count', 5),
(3, 'Code Warrior', 'Solve 10 programming problems', 'trophy-warrior.png', 'solved_count', 10),
(4, 'Grandmaster', 'Reach a rating of 2000+', 'trophy-grandmaster.png', 'rating', 2000)
ON CONFLICT (achievement_id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

INSERT INTO users (user_id, firebase_uid, username, email, display_name, avatar_url, role, rating, max_rating) VALUES
(1, 'uid_admin_001', 'admin', 'admin@codedour.com', 'System Admin', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', 'admin', 2100, 2100),
(2, 'uid_problemsetter', 'setter_john', 'john@codedour.com', 'John Doe (Setter)', 'https://api.dicebear.com/7.x/bottts/svg?seed=john', 'setter', 1850, 1850),
(3, 'uid_alice', 'alice_coder', 'alice@codedour.com', 'Alice Smith', 'https://api.dicebear.com/7.x/bottts/svg?seed=alice', 'user', 1650, 1700),
(4, 'uid_bob', 'bob_builder', 'bob@codedour.com', 'Bob Johnson', 'https://api.dicebear.com/7.x/bottts/svg?seed=bob', 'user', 1420, 1500),
(5, 'uid_charlie', 'charlie_dev', 'charlie@codedour.com', 'Charlie Brown', 'https://api.dicebear.com/7.x/bottts/svg?seed=charlie', 'user', 1580, 1600)
ON CONFLICT (user_id) DO NOTHING;

SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('achievements_achievement_id_seq', (SELECT MAX(achievement_id) FROM achievements));

INSERT INTO user_statistics (user_id, total_submissions, accepted_solutions, acceptance_rate, solved_problems, current_rating, highest_rating) VALUES
(1, 0, 0, 0.00, 0, 2100, 2100),
(2, 0, 0, 0.00, 0, 1850, 1850),
(3, 0, 0, 0.00, 0, 1650, 1700),
(4, 0, 0, 0.00, 0, 1420, 1500),
(5, 0, 0, 0.00, 0, 1580, 1600)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO tags (tag_id, name, description) VALUES
(1, 'Arrays', 'Problems involving array manipulation and indexing'),
(2, 'Strings', 'Problems involving string processing and searching'),
(3, 'Math', 'Problems involving arithmetic, algebra, or number theory'),
(4, 'Dynamic Programming', 'Optimization problems solved via overlapping subproblems'),
(5, 'Two Pointers', 'Techniques using two pointer positions to scan linear data structures')
ON CONFLICT (tag_id) DO NOTHING;

SELECT setval('tags_tag_id_seq', (SELECT MAX(tag_id) FROM tags));

INSERT INTO topic_dependencies (topic_id, prerequisite_id) VALUES
(5, 1),
(4, 1),
(4, 3)
ON CONFLICT DO NOTHING;

INSERT INTO problems (problem_id, slug, title, description, input_format, output_format, constraints, difficulty, time_limit, memory_limit, author_id) VALUES
(1, 'two-sum', 'Two Sum', 
 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
 'First line contains integer N and target T. Second line contains N space-separated integers.',
 'Print space-separated 0-indexed indices of the two numbers.',
 '2 <= N <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9',
 'Easy', 1.0, 256, 2),

(2, 'valid-palindrome', 'Valid Palindrome', 
 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
 'A single line containing the input string S.',
 'Print "YES" if it is a palindrome, otherwise "NO".',
 '1 <= length(S) <= 2 * 10^5',
 'Easy', 1.0, 256, 2),

(3, 'fibonacci-number', 'Fibonacci Number', 
 'The Fibonacci numbers form a sequence such that F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2) for n > 1. Calculate F(n) modulo 10^9+7.',
 'A single integer N.',
 'Print the value of F(N) modulo 1000000007.',
 '0 <= N <= 10^6',
 'Medium', 2.0, 256, 1)
ON CONFLICT (problem_id) DO NOTHING;

SELECT setval('problems_problem_id_seq', (SELECT MAX(problem_id) FROM problems));

INSERT INTO problem_tags (problem_id, tag_id) VALUES
(1, 1), (1, 5),
(2, 2), (2, 5),
(3, 3), (3, 4)
ON CONFLICT DO NOTHING;

INSERT INTO test_cases (test_case_id, problem_id, input, expected_output, is_sample, explanation) VALUES
(1, 1, '4 9\n2 7 11 15', '0 1', TRUE, 'nums[0] + nums[1] == 2 + 7 == 9, so we return [0, 1].'),
(2, 1, '3 6\n3 2 4', '1 2', TRUE, 'nums[1] + nums[2] == 2 + 4 == 6.'),
(3, 2, 'A man, a plan, a canal: Panama', 'YES', TRUE, '"amanaplanacanalpanama" is a palindrome.'),
(4, 2, 'race a car', 'NO', TRUE, '"raceacar" is not a palindrome.'),
(5, 3, '5', '5', TRUE, 'F(5) = 5.'),
(6, 3, '10', '55', FALSE, 'F(10) = 55.')
ON CONFLICT (test_case_id) DO NOTHING;

SELECT setval('test_cases_test_case_id_seq', (SELECT MAX(test_case_id) FROM test_cases));

INSERT INTO contests (contest_id, title, slug, description, start_time, end_time, duration_minutes, is_published, created_by) VALUES
(1, 'CodeDour Weekly Contest 1', 'codedour-weekly-1', 
 'Welcome to the inaugural CodeDour Weekly Contest! Test your problem solving skills with 3 algorithmic challenges.',
 CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '2 days', 120, TRUE, 1)
ON CONFLICT (contest_id) DO NOTHING;

SELECT setval('contests_contest_id_seq', (SELECT MAX(contest_id) FROM contests));

INSERT INTO contest_problems (contest_id, problem_id, problem_order, points) VALUES
(1, 1, 'A', 100),
(1, 2, 'B', 200),
(1, 3, 'C', 300)
ON CONFLICT DO NOTHING;

INSERT INTO contest_participants (contest_id, user_id, score, penalty, rank, old_rating, new_rating) VALUES
(1, 3, 300, 45, 1, 1650, 1695),
(1, 4, 100, 12, 2, 1420, 1435),
(1, 5, 0, 0, 3, 1580, 1565)
ON CONFLICT DO NOTHING;
