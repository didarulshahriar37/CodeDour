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

        let currentUserId = null;
        let currentUserRole = null;

        if (req.user) {
            const userRes = await pool.query(`SELECT user_id, role FROM users WHERE firebase_uid = $1`, [req.user.uid]);
            if (userRes.rows.length > 0) {
                currentUserId = userRes.rows[0].user_id;
                currentUserRole = userRes.rows[0].role;
            }
        }

        const contestRes = await pool.query(`
            SELECT contest_id, created_by, is_published,
                CASE 
                    WHEN NOW() < start_time THEN 'upcoming'
                    WHEN NOW() BETWEEN start_time AND end_time THEN 'running'
                    ELSE 'ended'
                END AS status 
            FROM contests WHERE contest_id::text = $1 OR slug = $1
        `, [id]);

        if (contestRes.rows.length === 0) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        const contest = contestRes.rows[0];

        if (contest.status !== 'ended') {
            const isOwner = currentUserId && contest.created_by === currentUserId;
            const isAdmin = currentUserRole === 'admin';

            let isRegistered = false;
            if (currentUserId) {
                const regCheck = await pool.query(
                    `SELECT 1 FROM contest_participants WHERE contest_id = $1 AND user_id = $2`,
                    [contest.contest_id, currentUserId]
                );
                isRegistered = regCheck.rows.length > 0;
            }

            if (!isRegistered && !isOwner && !isAdmin) {
                return res.status(403).json({
                    error: 'Access denied. You must be a registered participant in this contest to view its leaderboard.'
                });
            }
        }

        const result = await pool.query(`
            SELECT contest_id, user_id, username, display_name, avatar_url, score, penalty, calculated_rank AS rank, old_rating, new_rating 
            FROM contest_leaderboard_matview
            WHERE contest_id = $1 AND ($2::text IS NULL OR username ILIKE '%' || $2 || '%' OR display_name ILIKE '%' || $2 || '%')
            ORDER BY calculated_rank ASC LIMIT $3 OFFSET $4
        `, [contest.contest_id, search || null, limit, offset]);

        res.status(200).json({
            contest_id: contest.contest_id,
            leaderboard: result.rows
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getGlobalLeaderboard, getContestLeaderboard };