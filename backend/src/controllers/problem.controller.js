const pool = require('../config/db');

const getAllProblems = async (req, res, next) => {
    try {
        const { difficulty, search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let userId = null;
        if (req.user?.uid) {
            const userResult = await pool.query(
                `SELECT user_id FROM users WHERE firebase_uid = $1`, [req.user.uid]
            );
            if (userResult.rows.length > 0) {
                userId = userResult.rows[0].user_id;
            }
        }

        const result = await pool.query(
            `SELECT p.problem_id, p.slug, p.title, p.difficulty, p.total_submissions, p.accepted_submissions,
                CASE WHEN p.total_submissions > 0 THEN ROUND((p.accepted_submissions::numeric / p.total_submissions::numeric) * 100, 2) 
                ELSE 0.00 END AS acceptance_rate,
                (SELECT COUNT(DISTINCT user_id)::int FROM submissions WHERE problem_id = p.problem_id AND status = 'Accepted') AS solved_by_count,
                CASE WHEN $3::int IS NOT NULL THEN
                    EXISTS (SELECT 1 FROM submissions s2 WHERE s2.problem_id = p.problem_id AND s2.user_id = $3 AND s2.status = 'Accepted')
                ELSE FALSE END AS solved,
                u.username AS author_name, p.created_at,
                COALESCE(ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
             FROM problems p
             LEFT JOIN users u ON p.author_id = u.user_id
             LEFT JOIN problem_tags pt ON p.problem_id = pt.problem_id
             LEFT JOIN tags t ON pt.tag_id = t.tag_id
             WHERE p.is_public = TRUE
               AND ($1::text IS NULL OR p.difficulty = $1)
               AND ($2::text IS NULL OR p.title ILIKE '%' || $2 || '%' OR p.slug ILIKE '%' || $2 || '%')
             GROUP BY p.problem_id, p.slug, p.title, p.difficulty, p.total_submissions, p.accepted_submissions, u.username, p.created_at
             ORDER BY p.problem_id ASC
             LIMIT $4 OFFSET $5`,
            [difficulty || null, search || null, userId, limit, offset]
        );
        res.status(200).json({ 
            problems: result.rows 
        });
    } catch (error) {
        next(error);
    }
};

const getProblemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT p.problem_id, p.slug, p.title, p.description, p.input_format, p.output_format, p.constraints, p.difficulty, p.time_limit, p.memory_limit, p.author_id, p.is_public, p.total_submissions, p.accepted_submissions, u.username AS author_name, COALESCE(ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags FROM problems p LEFT JOIN users u ON p.author_id = u.user_id LEFT JOIN problem_tags pt ON p.problem_id = pt.problem_id LEFT JOIN tags t ON pt.tag_id = t.tag_id WHERE p.slug = $1 OR p.problem_id::text = $1 GROUP BY p.problem_id, u.username`, [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Problem not found' 
            });
        }

        const testCases = await pool.query(
            `SELECT test_case_id, input, expected_output, explanation
             FROM test_cases
             WHERE problem_id = $1 AND is_sample = TRUE
             ORDER BY test_case_id ASC`,
            [result.rows[0].problem_id]
        );

        res.status(200).json({
            problem: result.rows[0],
            sample_test_cases: testCases.rows
        });
    } catch (error) {
        next(error);
    }
};


const createProblem = async (req, res, next) => {
    try {
        const { slug, title, description, input_format, output_format, constraints, difficulty, time_limit, memory_limit, author_id, is_public, tags, test_cases } = req.body;

        const result = await pool.query(
            `INSERT INTO problems (slug, title, description, input_format, output_format, constraints, difficulty, time_limit, memory_limit, author_id, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 1.0), COALESCE($9, 256), $10, COALESCE($11, TRUE)) RETURNING *`, [slug, title, description, input_format, output_format, constraints, difficulty, time_limit, memory_limit, author_id, is_public]
        );
        const problemId = result.rows[0].problem_id;

        if (tags && tags.length > 0) {
            for (const tagId of tags) {
                await pool.query(
                    `INSERT INTO problem_tags (problem_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [problemId, tagId]
                );
            }
        }

        if (test_cases && test_cases.length > 0) {
            for (const tc of test_cases) {
                await pool.query(
                    `INSERT INTO test_cases (problem_id, input, expected_output, is_sample, explanation) VALUES ($1, $2, $3, COALESCE($4, FALSE), $5)`, [problemId, tc.input, tc.expected_output, tc.is_sample, tc.explanation]
                );
            }
        }
        res.status(201).json({
            message: 'Problem created successfully',
            problem: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const getRecommendedByTags = async (req, res, next) => {
    try {
        const { id } = req.params;

        const problemResult = await pool.query(
            `SELECT problem_id FROM problems WHERE slug = $1 OR problem_id::text = $1`,
            [id]
        );
        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        const currentProblemId = problemResult.rows[0].problem_id;

        const result = await pool.query(
            `SELECT p.problem_id, p.slug, p.title, p.difficulty,
                    COALESCE(ARRAY_AGG(t2.name) FILTER (WHERE t2.name IS NOT NULL), '{}') AS tags,
                    COUNT(DISTINCT pt.tag_id)::int AS tag_match_count,
                    (SELECT COUNT(DISTINCT user_id)::int FROM submissions WHERE problem_id = p.problem_id AND status = 'Accepted') AS solved_by_count
             FROM problems p
             JOIN problem_tags pt ON p.problem_id = pt.problem_id
             LEFT JOIN problem_tags pt2 ON p.problem_id = pt2.problem_id
             LEFT JOIN tags t2 ON pt2.tag_id = t2.tag_id
             WHERE pt.tag_id IN (SELECT tag_id FROM problem_tags WHERE problem_id = $1)
               AND p.problem_id != $1
               AND p.is_public = TRUE
             GROUP BY p.problem_id, p.slug, p.title, p.difficulty
             ORDER BY tag_match_count DESC, p.problem_id ASC
             LIMIT 4`,
            [currentProblemId]
        );

        res.status(200).json({ recommendations: result.rows });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllProblems, getProblemById, createProblem, getRecommendedByTags };