const pool = require('../config/db');
const { processContestRatings } = require('../utils/ratingProcessor');

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

        if (contest.status === 'ended') {
            try {
                await processContestRatings(contest.contest_id, false);
            } catch (rErr) {
                console.error('Error auto-processing ratings in getContestLeaderboard:', rErr.message);
            }
        } else {
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
            WITH first_ac AS (
                SELECT 
                    s.user_id,
                    s.contest_id,
                    s.problem_id,
                    MIN(s.submitted_at) AS first_accepted_time,
                    MAX(cp.points) AS points_earned
                FROM submissions s
                JOIN contest_problems cp ON s.contest_id = cp.contest_id AND s.problem_id = cp.problem_id
                JOIN contests c ON s.contest_id = c.contest_id
                WHERE s.contest_id = $1
                  AND s.status = 'Accepted'
                  AND s.submitted_at >= c.start_time
                  AND s.submitted_at <= c.end_time
                GROUP BY s.user_id, s.contest_id, s.problem_id
            ),
            wrong_attempts AS (
                SELECT 
                    fa.user_id,
                    fa.problem_id,
                    COUNT(*)::int AS wrong_count
                FROM first_ac fa
                JOIN submissions s ON s.contest_id = fa.contest_id AND s.user_id = fa.user_id AND s.problem_id = fa.problem_id
                WHERE s.status != 'Accepted'
                  AND s.submitted_at < fa.first_accepted_time
                GROUP BY fa.user_id, fa.problem_id
            ),
            user_problem_stats AS (
                SELECT 
                    fa.user_id,
                    fa.problem_id,
                    fa.points_earned,
                    fa.first_accepted_time,
                    COALESCE(wa.wrong_count, 0) AS wrong_attempts
                FROM first_ac fa
                LEFT JOIN wrong_attempts wa ON fa.user_id = wa.user_id AND fa.problem_id = wa.problem_id
            ),
            user_live_scores AS (
                SELECT 
                    ups.user_id,
                    COUNT(ups.problem_id)::int AS problems_solved,
                    SUM(ups.points_earned)::int AS total_score,
                    SUM(
                        GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (ups.first_accepted_time - c.start_time)) / 60)) + 
                        (ups.wrong_attempts * 20)
                    )::int AS total_penalty
                FROM user_problem_stats ups
                JOIN contests c ON c.contest_id = $1
                GROUP BY ups.user_id
            )
            SELECT 
                cp.contest_id,
                cp.user_id,
                u.username,
                u.display_name,
                u.avatar_url,
                u.rating,
                COALESCE(uls.total_score, cp.score, 0)::int AS score,
                COALESCE(uls.total_penalty, cp.penalty, 0)::int AS penalty,
                COALESCE(uls.problems_solved, 0)::int AS problems_solved,
                DENSE_RANK() OVER (
                    ORDER BY COALESCE(uls.total_score, cp.score, 0) DESC, COALESCE(uls.total_penalty, cp.penalty, 0) ASC, cp.registered_at ASC
                )::int AS rank,
                cp.old_rating,
                cp.new_rating
            FROM contest_participants cp
            JOIN users u ON cp.user_id = u.user_id
            LEFT JOIN user_live_scores uls ON cp.user_id = uls.user_id
            WHERE cp.contest_id = $1
              AND ($2::text IS NULL OR u.username ILIKE '%' || $2 || '%' OR u.display_name ILIKE '%' || $2 || '%')
            ORDER BY rank ASC, cp.registered_at ASC
            LIMIT $3 OFFSET $4
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