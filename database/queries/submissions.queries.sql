-- CodeDour CRUD Queries: Submission Management

-- Name: CreateSubmission
INSERT INTO submissions (user_id, problem_id, contest_id, language, language_id, code, token, status)
VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending')
RETURNING submission_id, user_id, problem_id, contest_id, language, language_id, status, submitted_at;

-- Name: GetSubmissionById
SELECT s.submission_id, s.user_id, u.username, s.problem_id, p.title AS problem_title, p.slug AS problem_slug,
       s.contest_id, s.language, s.language_id, s.code, s.status, s.execution_time, s.memory_used, s.token, s.error_message, s.submitted_at
FROM submissions s
JOIN problems p ON s.problem_id = p.problem_id
JOIN users u ON s.user_id = u.user_id
WHERE s.submission_id = $1;

-- Name: ListSubmissions
SELECT s.submission_id, s.user_id, u.username, s.problem_id, p.title AS problem_title, p.slug AS problem_slug,
       s.contest_id, s.language, s.status, s.execution_time, s.memory_used, s.submitted_at
FROM submissions s
JOIN problems p ON s.problem_id = p.problem_id
JOIN users u ON s.user_id = u.user_id
WHERE ($1::int IS NULL OR s.user_id = $1)
  AND ($2::int IS NULL OR s.problem_id = $2)
  AND ($3::int IS NULL OR s.contest_id = $3)
  AND ($4::text IS NULL OR s.status = $4)
ORDER BY s.submitted_at DESC
LIMIT $5 OFFSET $6;

-- Name: GetSubmissionByToken
SELECT submission_id, user_id, problem_id, contest_id, status, token
FROM submissions
WHERE token = $1;

-- Name: CallProcessSubmissionProcedure
CALL process_submission($1, $2, $3, $4, $5);
