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
        const { id } = req.params;
        const { search, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        const result = await pool.query(`
            SELECT contest_id,user_id,username,display_name,avatar_url,score,penalty,calculated_rank AS rank,old_rating,new_rating 
            FROM contest_leaderboard_matview
            WHERE contest_id::text = $1 AND ($2::text IS NULL OR username ILIKE '%' || $2 || '%' OR display_name ILIKE '%' || $2 || '%')
            ORDER BY calculated_rank ASC LIMIT $3 OFFSET $4
        `, [id, search || null, limit, offset]);

        res.status(200).json({
            contest_id: id,
            leaderboard: result.rows
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getGlobalLeaderboard, getContestLeaderboard };