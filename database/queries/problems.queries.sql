-- CodeDour CRUD Queries: Problem Management

-- Name: ListProblems
SELECT p.problem_id, p.slug, p.title, p.difficulty, p.total_submissions, p.accepted_submissions, p.acceptance_rate, p.author_name, p.created_at,
       COALESCE(ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
FROM problem_stats_view p
LEFT JOIN problem_tags pt ON p.problem_id = pt.problem_id
LEFT JOIN tags t ON pt.tag_id = t.tag_id
WHERE ($1::text IS NULL OR p.difficulty = $1)
  AND ($2::text IS NULL OR p.title ILIKE '%' || $2 || '%' OR p.slug ILIKE '%' || $2 || '%')
GROUP BY p.problem_id, p.slug, p.title, p.difficulty, p.total_submissions, p.accepted_submissions, p.acceptance_rate, p.author_name, p.created_at
ORDER BY p.problem_id ASC
LIMIT $3 OFFSET $4;

-- Name: GetProblemBySlugOrId
SELECT p.problem_id, p.slug, p.title, p.description, p.input_format, p.output_format, p.constraints, p.difficulty, p.time_limit, p.memory_limit, p.author_id, p.is_public, p.total_submissions, p.accepted_submissions, u.username AS author_name,
       COALESCE(ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
FROM problems p
LEFT JOIN users u ON p.author_id = u.user_id
LEFT JOIN problem_tags pt ON p.problem_id = pt.problem_id
LEFT JOIN tags t ON pt.tag_id = t.tag_id
WHERE p.slug = $1 OR p.problem_id::text = $1
GROUP BY p.problem_id, p.slug, p.title, p.description, p.input_format, p.output_format, p.constraints, p.difficulty, p.time_limit, p.memory_limit, p.author_id, p.is_public, p.total_submissions, p.accepted_submissions, u.username;

-- Name: GetProblemTestCases
SELECT test_case_id, problem_id, input, expected_output, is_sample, explanation
FROM test_cases
WHERE problem_id = $1
ORDER BY is_sample DESC, test_case_id ASC;

-- Name: GetSampleTestCases
SELECT test_case_id, problem_id, input, expected_output, explanation
FROM test_cases
WHERE problem_id = $1 AND is_sample = TRUE
ORDER BY test_case_id ASC;

-- Name: CreateProblem
INSERT INTO problems (slug, title, description, input_format, output_format, constraints, difficulty, time_limit, memory_limit, author_id, is_public)
VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 1.0), COALESCE($9, 256), $10, COALESCE($11, TRUE))
RETURNING problem_id, slug, title, difficulty, time_limit, memory_limit, created_at;

-- Name: UpdateProblem
UPDATE problems
SET title = COALESCE($1, title),
    description = COALESCE($2, description),
    input_format = COALESCE($3, input_format),
    output_format = COALESCE($4, output_format),
    constraints = COALESCE($5, constraints),
    difficulty = COALESCE($6, difficulty),
    time_limit = COALESCE($7, time_limit),
    memory_limit = COALESCE($8, memory_limit),
    is_public = COALESCE($9, is_public),
    updated_at = CURRENT_TIMESTAMP
WHERE problem_id = $10
RETURNING problem_id, slug, title, updated_at;

-- Name: DeleteProblem
DELETE FROM problems WHERE problem_id = $1;

-- Name: AddTagToProblem
INSERT INTO problem_tags (problem_id, tag_id)
VALUES ($1, $2)
ON CONFLICT DO NOTHING;

-- Name: AddTestCase
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, explanation)
VALUES ($1, $2, $3, COALESCE($4, FALSE), $5)
RETURNING test_case_id, problem_id, is_sample;
