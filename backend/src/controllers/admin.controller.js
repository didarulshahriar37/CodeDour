const pool = require('../config/db');

const getAllUsers = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT user_id, firebase_uid, username, email, display_name, avatar_url, role, rating, max_rating, problems_solved, total_submissions, created_at
             FROM users
             ORDER BY user_id ASC`
        );
        res.status(200).json({ users: result.rows });
    } catch (error) {
        next(error);
    }
};

const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: "Invalid role specified. Must be 'user' or 'admin'." });
        }

        const result = await pool.query(
            `UPDATE users SET role = $1, updated_at = NOW() WHERE user_id = $2 RETURNING user_id, username, email, role`,
            [role, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User role updated successfully', user: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`DELETE FROM users WHERE user_id = $1 RETURNING user_id, username`, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully', user: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const updateProblem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, slug, description, input_format, output_format, constraints, difficulty, time_limit, memory_limit, is_public } = req.body;

        const result = await pool.query(
            `UPDATE problems
             SET title = COALESCE($1, title),
                 slug = COALESCE($2, slug),
                 description = COALESCE($3, description),
                 input_format = COALESCE($4, input_format),
                 output_format = COALESCE($5, output_format),
                 constraints = COALESCE($6, constraints),
                 difficulty = COALESCE($7, difficulty),
                 time_limit = COALESCE($8, time_limit),
                 memory_limit = COALESCE($9, memory_limit),
                 is_public = COALESCE($10, is_public),
                 updated_at = NOW()
             WHERE problem_id = $11 OR slug = $11
             RETURNING *`,
            [title, slug, description, input_format, output_format, constraints, difficulty, time_limit, memory_limit, is_public, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const problemId = result.rows[0].problem_id;
        const { tags, test_cases } = req.body;
        if (tags && Array.isArray(tags)) {
            await pool.query(`DELETE FROM problem_tags WHERE problem_id = $1`, [problemId]);
            for (const tagId of tags) {
                await pool.query(
                    `INSERT INTO problem_tags (problem_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [problemId, tagId]
                );
            }
        }

        if (test_cases && Array.isArray(test_cases)) {
            await pool.query(`DELETE FROM test_cases WHERE problem_id = $1`, [problemId]);
            for (const tc of test_cases) {
                await pool.query(
                    `INSERT INTO test_cases (problem_id, input, expected_output, is_sample, explanation)
                     VALUES ($1, $2, $3, COALESCE($4, FALSE), $5)`,
                    [problemId, tc.input, tc.expected_output, tc.is_sample, tc.explanation || null]
                );
            }
        }

        res.status(200).json({ message: 'Problem updated successfully', problem: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const deleteProblem = async (req, res, next) => {
    try {
        const { id } = req.params;

        const probRes = await pool.query(
            `SELECT problem_id FROM problems WHERE slug = $1 OR problem_id::text = $1`,
            [id]
        );
        if (probRes.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        const problemId = probRes.rows[0].problem_id;

        await pool.query(`DELETE FROM problem_tags WHERE problem_id = $1`, [problemId]);
        await pool.query(`DELETE FROM test_cases WHERE problem_id = $1`, [problemId]);
        await pool.query(`DELETE FROM submissions WHERE problem_id = $1`, [problemId]);

        const result = await pool.query(`DELETE FROM problems WHERE problem_id = $1 RETURNING problem_id, title`, [problemId]);

        res.status(200).json({ message: 'Problem deleted successfully', problem: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const refreshViews = async (req, res, next) => {
    try {
        await pool.query(`REFRESH MATERIALIZED VIEW contest_leaderboard_matview`);
        res.status(200).json({ 
            message: 'Materialized views refreshed successfully' 
        });
    } catch (error) {
        next(error);
    }
};

const deleteContest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `DELETE FROM contests WHERE contest_id::text = $1 OR slug = $1 RETURNING contest_id, title`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Contest not found' 
            });
        }

        res.status(200).json({ 
            message: 'Contest deleted successfully', 
            contest: result.rows[0] 
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser,
    updateProblem,
    deleteProblem,
    refreshViews,
    deleteContest
};
