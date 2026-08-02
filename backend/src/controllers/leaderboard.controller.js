const pool = require('../config/db');

const getGlobalLeaderboard = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const result = await pool.query(
            `SELECT user_id, username, display_name, avatar_url, role, rating, max_rating, problems_solved, total_submissions, accuracy_rate, global_rank FROM user_stats_view WHERE ($1::text IS NULL OR username ILIKE '%' || $1 || '%' OR display_name ILIKE '%' || $1 || '%') ORDER BY rating DESC LIMIT $2 OFFSET $3`, [search || null, limit, offset]
        );
        res.status(200).json({
            leaderboard: result.rows 
        });
    } catch (error) {
        next(error);
    }
};

const getContestLeaderboard = async (req, res, next) => {
    try {
        res.status(200).json({ 
            message: 'not implemented yet' 
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getGlobalLeaderboard, getContestLeaderboard };