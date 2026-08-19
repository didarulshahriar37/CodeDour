const pool = require('../config/db');

const getMyProfile = async (req, res, next) => {
    try {

        const {uid} = req.user;
        const result = await pool.query(
            `SELECT user_id, firebase_uid, username, email, display_name, avatar_url, role, rating, max_rating, problems_solved, total_submissions, created_at FROM users WHERE firebase_uid = $1`,[uid]
        );

        if(result.rows.length === 0){
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.status(200).json({ 
            user: result.rows[0] 
        });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {

        const {id} = req.params;
        const result = await pool.query(
            `SELECT user_id, username, email, display_name, avatar_url, role, rating, max_rating, problems_solved, total_submissions, created_at FROM users WHERE user_id = $1`, [id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.status(200).json({ 
            user: result.rows[0] 
        });
    } catch (error) {
        next(error);
    }
};

const getUserStats = async (req, res, next) => {
    try {
        const {id} = req.params;
        const result = await pool.query(
            `SELECT * FROM get_user_statistics($1)`,[id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.status(200).json({ 
            stats: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const getUserSubmissions = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {page = 1, limit = 20} = req.query;
        const offset = (page-1)*limit;
        const result = await pool.query(
            `SELECT s.submission_id, s.problem_id, p.title AS problem_title, p.slug AS problem_slug, s.language, s.status, s.execution_time, s.memory_used, s.submitted_at FROM submissions s JOIN problems p ON s.problem_id = p.problem_id WHERE s.user_id = $1 ORDER BY s.submitted_at DESC LIMIT $2 OFFSET $3`,[id, limit, offset]
        );

        res.status(200).json({ 
            submissions: result.rows
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const { display_name, avatar_url } = req.body;

        const result = await pool.query(`
            UPDATE users
            SET 
                display_name = COALESCE($1, display_name),
                avatar_url = COALESCE($2, avatar_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE firebase_uid = $3
            RETURNING user_id, firebase_uid, username, email, display_name, avatar_url, role, rating, max_rating, problems_solved, total_submissions, created_at
        `, [display_name || null, avatar_url || null, uid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getMyProfile, getUserById, getUserStats, getUserSubmissions, updateProfile };