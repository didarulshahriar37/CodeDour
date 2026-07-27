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

-- 1. Users Table
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

-- 2. Problems Table
CREATE TABLE problems (
    problem_id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL,
    constraints TEXT NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'Easy',
    time_limit DOUBLE PRECISION DEFAULT 1.0, -- seconds
    memory_limit INT DEFAULT 256, -- MB
    author_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT TRUE,
    total_submissions INT DEFAULT 0,
    accepted_submissions INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tags Table
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- 4. Problem Tags Junction Table
CREATE TABLE problem_tags (
    problem_id INT REFERENCES problems(problem_id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, tag_id)
);

-- 5. Test Cases Table
CREATE TABLE test_cases (
    test_case_id SERIAL PRIMARY KEY,
    problem_id INT REFERENCES problems(problem_id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_sample BOOLEAN DEFAULT FALSE,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Contests Table
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


-- 7. Contest Problems Table
CREATE TABLE contest_problems (
    contest_id INT REFERENCES contests(contest_id) ON DELETE CASCADE,
    problem_id INT REFERENCES problems(problem_id) ON DELETE CASCADE,
    problem_order VARCHAR(5) NOT NULL,
    points INT DEFAULT 100,
    PRIMARY KEY (contest_id, problem_id)
);

-- 8. Contest Participants Table
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

-- 9. Submissions Table
CREATE TABLE submissions (
    submission_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    problem_id INT REFERENCES problems(problem_id) ON DELETE CASCADE,
    contest_id INT REFERENCES contests(contest_id) ON DELETE SET NULL,
    language VARCHAR(30) NOT NULL,
    language_id INT,
    code TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending',
    execution_time DOUBLE PRECISION, -- in seconds
    memory_used INT, -- in KB
    token VARCHAR(100), -- Judge0 submission token
    error_message TEXT,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Achievements Table
CREATE TABLE achievements (
    achievement_id SERIAL PRIMARY KEY,
    title VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(255),
    criteria_type VARCHAR(50) NOT NULL,
    criteria_value INT NOT NULL
);

-- 11. User Achievements Table
CREATE TABLE user_achievements (
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    achievement_id INT REFERENCES achievements(achievement_id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

-- 12. Rating History Table
CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    contest_id INT REFERENCES contests(contest_id) ON DELETE CASCADE,
    old_rating INT NOT NULL,
    new_rating INT NOT NULL,
    rating_change INT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 13. Topic Dependencies Table (Learning Path Prerequisites)
CREATE TABLE topic_dependencies (
    topic_id INT REFERENCES tags(tag_id) ON DELETE CASCADE,
    prerequisite_id INT REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (topic_id, prerequisite_id)
);

-- 14. User Statistics Summary Table
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
