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
