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

        const submission = await pool.query(
            `INSERT INTO submissions (user_id, problem_id, contest_id, language, language_id, code, status) VALUES ($1, $2, $3, $4, $5, $6, 'Pending') RETURNING submission_id, user_id, problem_id, language, status, submitted_at`, [req.body.user_id || 1, problem_id, contest_id || null, language, language_id, code]
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

module.exports = { submitSolution, getSubmissionById };