const pool = require('../config/db');

const processContestRatings = async (contestId, forceRecalculate = false) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const contestRes = await client.query(`
            SELECT contest_id, start_time, end_time,
                CASE 
                    WHEN NOW() < start_time THEN 'upcoming'
                    WHEN NOW() BETWEEN start_time AND end_time THEN 'running'
                    ELSE 'ended'
                END AS status 
            FROM contests WHERE contest_id::text = $1 OR slug = $1
        `, [contestId]);

        if (contestRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return false;
        }

        const contest = contestRes.rows[0];
        const actualContestId = contest.contest_id;

        if (contest.status !== 'ended' && !forceRecalculate) {
            await client.query('ROLLBACK');
            return false;
        }

        if (!forceRecalculate) {
            const checkRes = await client.query(`
                SELECT 1 FROM contest_participants 
                WHERE contest_id = $1 AND new_rating IS NOT NULL 
                LIMIT 1
            `, [actualContestId]);

            if (checkRes.rows.length > 0) {
                await client.query('ROLLBACK');
                return true;
            }
        }

        const liveScoresRes = await client.query(`
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
            )
            SELECT 
                ups.user_id,
                SUM(ups.points_earned)::int AS total_score,
                SUM(
                    GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (ups.first_accepted_time - c.start_time)) / 60)) + 
                    (ups.wrong_attempts * 20)
                )::int AS total_penalty
            FROM user_problem_stats ups
            JOIN contests c ON c.contest_id = $1
            GROUP BY ups.user_id
        `, [actualContestId]);

        const liveScores = {};
        for (const row of liveScoresRes.rows) {
            liveScores[row.user_id] = {
                score: parseInt(row.total_score, 10),
                penalty: parseInt(row.total_penalty, 10)
            };
        }

        const cpRes = await client.query(`
            SELECT cp.contest_id, cp.user_id, cp.registered_at, cp.old_rating, u.rating
            FROM contest_participants cp
            JOIN users u ON cp.user_id = u.user_id
            WHERE cp.contest_id = $1
        `, [actualContestId]);

        if (cpRes.rows.length === 0) {
            await client.query('COMMIT');
            return true;
        }

        const participants = cpRes.rows.map(p => {
            const live = liveScores[p.user_id] || { score: 0, penalty: 0 };
            const baseRating = (p.rating && p.rating > 0) ? p.rating : 1500;
            return {
                user_id: p.user_id,
                registered_at: p.registered_at,
                current_rating: baseRating,
                score: live.score,
                penalty: live.penalty
            };
        });

        participants.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.penalty !== b.penalty) return a.penalty - b.penalty;
            return new Date(a.registered_at) - new Date(b.registered_at);
        });

        let currentRank = 1;
        for (let i = 0; i < participants.length; i++) {
            if (i > 0) {
                const prev = participants[i - 1];
                const curr = participants[i];
                if (curr.score !== prev.score || curr.penalty !== prev.penalty) {
                    currentRank = i + 1;
                }
            }
            participants[i].rank = currentRank;
        }

        const totalParticipants = participants.length;

        for (const p of participants) {
            const oldRating = p.current_rating;
            const ratingChange = Math.round((totalParticipants / 2 - p.rank + 1) * 15);
            const newRating = Math.max(100, oldRating + ratingChange);

            await client.query(`
                UPDATE contest_participants
                SET score = $1, penalty = $2, rank = $3, old_rating = $4, new_rating = $5
                WHERE contest_id = $6 AND user_id = $7
            `, [p.score, p.penalty, p.rank, oldRating, newRating, actualContestId, p.user_id]);

            await client.query(`
                UPDATE users
                SET rating = $1, max_rating = GREATEST(max_rating, $1), updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $2
            `, [newRating, p.user_id]);

            await client.query(`
                INSERT INTO user_statistics (user_id, current_rating, highest_rating, last_updated)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id) DO UPDATE SET
                    current_rating = EXCLUDED.current_rating,
                    highest_rating = GREATEST(user_statistics.highest_rating, EXCLUDED.highest_rating),
                    last_updated = CURRENT_TIMESTAMP
            `, [p.user_id, newRating, newRating]);

            await client.query(`
                INSERT INTO ratings (user_id, contest_id, old_rating, new_rating, rating_change, recorded_at)
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            `, [p.user_id, actualContestId, oldRating, newRating, ratingChange]);
        }

        try {
            await client.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY contest_leaderboard_matview`);
        } catch {
            try {
                await client.query(`REFRESH MATERIALIZED VIEW contest_leaderboard_matview`);
            } catch {}
        }

        await client.query('COMMIT');
        return true;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error processing contest ratings:', err);
        throw err;
    } finally {
        client.release();
    }
};

module.exports = { processContestRatings };
