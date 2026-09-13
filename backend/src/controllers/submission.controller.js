const pool = require('../config/db');
const { processSubmission } = require('../services/submission.service');

const submitSolution = async (req, res, next) => {
    try {
        const { problem_id, language, language_id, code, contest_id } = req.body;

        if (!problem_id || !language || !language_id || !code) {
            return res.status(400).json({ 
                error: 'Missing required fields: problem_id, language, language_id, code' 
            });
        }

        console.log('Inserting submission with status: Pending');

        const userResult = await pool.query(
            `SELECT user_id FROM users WHERE firebase_uid = $1`, [req.user.uid]
        );

        if(userResult.rows.length === 0){
            return res.status(401).json({
                error: 'User not found. Please Sign in first to continue.'
            });
        }

        const userId = userResult.rows[0].user_id;

        if (contest_id) {
            const participantCheck = await pool.query(
                `SELECT 1 FROM contest_participants WHERE contest_id = $1 AND user_id = $2`,
                [contest_id, userId]
            );
            if (participantCheck.rows.length === 0) {
                return res.status(403).json({
                    error: 'Access denied. You must register for this contest before submitting solutions.'
                });
            }
        }

        const submission = await pool.query(
            `INSERT INTO submissions (user_id, problem_id, contest_id, language, language_id, code, status) VALUES ($1, $2, $3, $4, $5, $6, 'Pending') RETURNING submission_id, user_id, problem_id, language, status, submitted_at`, [userId, problem_id, contest_id || null, language, language_id, code]
        );

        const submissionId = submission.rows[0].submission_id;

        const testCases = await pool.query(
            `SELECT input, expected_output FROM test_cases WHERE problem_id = $1 ORDER BY test_case_id ASC`, [problem_id]
        );

        if (testCases.rows.length === 0) {
            return res.status(400).json({ 
                error: 'No test cases found.' 
            });
        }

        const judgeResult = await processSubmission(code, language_id, testCases.rows);
        console.log('Judge0 result:', JSON.stringify(judgeResult, null, 2));

        const maxTime = Math.max(...judgeResult.results.map(r => parseFloat(r.time) || 0));
        const maxMemory = Math.max(...judgeResult.results.map(r => parseInt(r.memory) || 0));
        const errorMsg = judgeResult.results.find(r => r.stderr || r.compile_output);

        console.log('Verdict being saved:', judgeResult.verdict);

        await pool.query(
            `CALL process_submission($1, $2, $3, $4, $5)`, [submissionId, judgeResult.verdict, maxTime, maxMemory, errorMsg?.stderr || errorMsg?.compile_output || null]
        );
        res.status(201).json({
            message: 'Submission processed',
            submission_id: submissionId,
            verdict: judgeResult.verdict,
            execution_time: maxTime,
            memory_used: maxMemory,
            results: judgeResult.results
        });
    } catch (error) {
        next(error);
    }
};

const getSubmissionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT s.submission_id, s.user_id, u.username, s.problem_id, p.title AS problem_title, p.slug AS problem_slug, s.contest_id, s.language, s.language_id, s.code, s.status, s.execution_time, s.memory_used, s.error_message, s.submitted_at FROM submissions s JOIN problems p ON s.problem_id = p.problem_id JOIN users u ON s.user_id = u.user_id WHERE s.submission_id = $1`, [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Submission not found' 
            });
        }
        res.status(200).json({ 
            submission: result.rows[0] 
        });
    } catch (error) {
        next(error);
    }
};

const getAllSubmissions = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, pageSize, status, language, problem_id, problemId, contest_id, contestId } = req.query;
        const actualLimit = parseInt(pageSize || limit, 10);
        const offset = (parseInt(page, 10) - 1) * actualLimit;
        const targetProblemId = (problem_id || problemId) ? parseInt(problem_id || problemId, 10) : null;
        const targetContestId = (contest_id || contestId) ? parseInt(contest_id || contestId, 10) : null;

        if (!req.user?.uid) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userResult = await pool.query(
            `SELECT user_id FROM users WHERE firebase_uid = $1`, [req.user.uid]
        );

        if (userResult.rows.length === 0) {
            return res.status(200).json({
                items: [],
                submissions: [],
                total: 0,
                page: Number(page),
                pageSize: actualLimit
            });
        }

        const userId = userResult.rows[0].user_id;

        const statusMap = {
            'accepted': 'Accepted',
            'wrong_answer': 'Wrong Answer',
            'tle': 'Time Limit Exceeded',
            'mle': 'Memory Limit Exceeded',
            'runtime_error': 'Runtime Error',
            'compile_error': 'Compilation Error'
        };

        const dbStatus = (status && status !== 'all') ? (statusMap[status.toLowerCase()] || status) : null;
        const langFilter = (language && language !== 'all') ? language : null;

        const query = `
            SELECT 
                s.submission_id AS id,
                s.submission_id,
                s.user_id,
                s.problem_id AS "problemId",
                p.title AS "problemTitle",
                p.slug AS "problemSlug",
                s.contest_id,
                s.language,
                s.code,
                s.status,
                s.execution_time AS time,
                s.memory_used AS memory,
                s.submitted_at AS "submittedAt"
            FROM submissions s
            JOIN problems p ON s.problem_id = p.problem_id
            WHERE s.user_id = $1
              AND ($2::text IS NULL OR s.status = $2)
              AND ($3::text IS NULL OR s.language ILIKE '%' || $3 || '%')
              AND ($4::int IS NULL OR s.problem_id = $4)
              AND ($5::int IS NULL OR s.contest_id = $5)
            ORDER BY s.submitted_at DESC
            LIMIT $6 OFFSET $7
        `;

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM submissions s
            WHERE s.user_id = $1
              AND ($2::text IS NULL OR s.status = $2)
              AND ($3::text IS NULL OR s.language ILIKE '%' || $3 || '%')
              AND ($4::int IS NULL OR s.problem_id = $4)
              AND ($5::int IS NULL OR s.contest_id = $5)
        `;

        const [result, countResult] = await Promise.all([
            pool.query(query, [userId, dbStatus, langFilter, targetProblemId, targetContestId, actualLimit, offset]),
            pool.query(countQuery, [userId, dbStatus, langFilter, targetProblemId, targetContestId])
        ]);

        const total = parseInt(countResult.rows[0]?.total || 0, 10);

        res.status(200).json({
            items: result.rows,
            submissions: result.rows,
            total,
            page: Number(page),
            pageSize: actualLimit
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { submitSolution, getSubmissionById, getAllSubmissions };