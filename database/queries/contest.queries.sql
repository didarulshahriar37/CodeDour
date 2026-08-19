-- List_Contests
SELECT c.contest_id, c.title, c.slug, c.description, c.start_time, c.end_time, c.duration_minutes, c.is_published, c.created_by, u.username AS creator_name,
       COUNT(DISTINCT cp.user_id) AS participant_count,
       CASE 
           WHEN CURRENT_TIMESTAMP < c.start_time THEN 'UPCOMING'
           WHEN CURRENT_TIMESTAMP BETWEEN c.start_time AND c.end_time THEN 'RUNNING'
           ELSE 'FINISHED'
       END AS status
FROM contests c
LEFT JOIN users u ON c.created_by = u.user_id
LEFT JOIN contest_participants cp ON c.contest_id = cp.contest_id
WHERE ($1::boolean IS NULL OR c.is_published = $1)
GROUP BY c.contest_id, c.title, c.slug, c.description, c.start_time, c.end_time, c.duration_minutes, c.is_published, c.created_by, u.username
ORDER BY c.start_time DESC
LIMIT $2 OFFSET $3;

-- Get_Contest_ById
SELECT c.contest_id, c.title, c.slug, c.description, c.start_time, c.end_time, c.duration_minutes, c.is_published, c.created_by, u.username AS creator_name,
       COUNT(DISTINCT cp.user_id) AS participant_count,
       CASE 
           WHEN CURRENT_TIMESTAMP < c.start_time THEN 'UPCOMING'
           WHEN CURRENT_TIMESTAMP BETWEEN c.start_time AND c.end_time THEN 'RUNNING'
           ELSE 'FINISHED'
       END AS status
FROM contests c
LEFT JOIN users u ON c.created_by = u.user_id
LEFT JOIN contest_participants cp ON c.contest_id = cp.contest_id
WHERE c.slug = $1 OR c.contest_id::text = $1
GROUP BY c.contest_id, c.title, c.slug, c.description, c.start_time, c.end_time, c.duration_minutes, c.is_published, c.created_by, u.username;

-- Get_Contest_Problems
SELECT cp.contest_id, cp.problem_id, cp.problem_order, cp.points, p.title, p.slug, p.difficulty, p.time_limit, p.memory_limit
FROM contest_problems cp
JOIN problems p ON cp.problem_id = p.problem_id
WHERE cp.contest_id = $1
ORDER BY cp.problem_order ASC;

-- Register_User_For_Contest
INSERT INTO contest_participants (contest_id, user_id, old_rating)
VALUES ($1, $2, (SELECT rating FROM users WHERE user_id = $2))
ON CONFLICT (contest_id, user_id) DO NOTHING
RETURNING contest_id, user_id, registered_at;

--Check_UserContest_Registration
SELECT 1 FROM contest_participants WHERE contest_id = $1 AND user_id = $2;

--Create_Contest
INSERT INTO contests (title, slug, description, start_time, end_time, duration_minutes, is_published, created_by)
VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, FALSE), $8)
RETURNING contest_id, title, slug, start_time, end_time, created_at;

--Add_ProblemTo_Contest
INSERT INTO contest_problems (contest_id, problem_id, problem_order, points)
VALUES ($1, $2, $3, COALESCE($4, 100))
ON CONFLICT (contest_id, problem_id) DO UPDATE SET 
    problem_order = EXCLUDED.problem_order,
    points = EXCLUDED.points;
