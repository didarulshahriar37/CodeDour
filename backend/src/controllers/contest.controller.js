const pool = require('../config/db');

const getAllContests = async (req, res, next) => {
    try {
        const { status } = req.query;
        let currentUserId = null;

        if (req.user) {
            const userRes = await pool.query(`SELECT user_id FROM users WHERE firebase_uid = $1`, [req.user.uid]);
            if (userRes.rows.length > 0) {
                currentUserId = userRes.rows[0].user_id;
            }
        }

        const result = await pool.query(`
            SELECT 
                c.contest_id, c.title, c.slug, c.description, c.start_time, c.end_time, c.duration_minutes, c.is_published, c.created_at, c.created_by, u.display_name AS created_by_name,
                COUNT(DISTINCT cp.user_id)::int AS participant_count,
                CASE 
                    WHEN NOW() < c.start_time THEN 'upcoming'
                    WHEN NOW() BETWEEN c.start_time AND c.end_time THEN 'running'
                    ELSE 'ended'
                END AS status,
                COALESCE(bool_or(cp.user_id = $1), FALSE) AS is_registered
            FROM contests c
            LEFT JOIN users u ON c.created_by = u.user_id
            LEFT JOIN contest_participants cp ON c.contest_id = cp.contest_id
            WHERE c.is_published = TRUE 
            GROUP BY c.contest_id, c.created_by, u.display_name 
            ORDER BY c.start_time DESC
        `, [currentUserId]);

        let contests = result.rows;
        if (status) {
            contests = contests.filter(c => c.status === status);
        }
        res.status(200).json({ contests });
    } catch (error) {
        next(error);
    }
};

const getContestById = async (req, res, next) => {
    try {
        const { id } = req.params;
        let currentUserId = null;
        let currentUserRole = null;

        if (req.user) {
            const userRes = await pool.query(`SELECT user_id, role FROM users WHERE firebase_uid = $1`, [req.user.uid]);
            if (userRes.rows.length > 0) {
                currentUserId = userRes.rows[0].user_id;
                currentUserRole = userRes.rows[0].role;
            }
        }

        const contestResult = await pool.query(`
            SELECT 
                c.contest_id, c.title, c.slug, c.description, c.start_time, c.end_time, c.duration_minutes, c.is_published, c.created_at, c.created_by, u.display_name AS created_by_name,
                COUNT(DISTINCT cp.user_id)::int AS participant_count,
                CASE 
                    WHEN NOW() < c.start_time THEN 'upcoming'
                    WHEN NOW() BETWEEN c.start_time AND c.end_time THEN 'running'
                    ELSE 'ended'
                END AS status,
                COALESCE(bool_or(cp.user_id = $2), FALSE) AS is_registered
            FROM contests c
            LEFT JOIN users u ON c.created_by = u.user_id
            LEFT JOIN contest_participants cp ON c.contest_id = cp.contest_id 
            WHERE c.contest_id::text = $1 OR c.slug = $1 
            GROUP BY c.contest_id, c.created_by, u.display_name
        `, [id, currentUserId]);

        if (contestResult.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Contest not found' 
            });
        }

        const contest = contestResult.rows[0];

        if (!contest.is_published) {
            const isOwner = currentUserId && contest.created_by === currentUserId;
            const isAdmin = currentUserRole === 'admin';
            if (!isOwner && !isAdmin) {
                return res.status(403).json({
                    error: 'Access denied. This contest is not published yet.'
                });
            }
        }

        const problemsResult = await pool.query(`
            SELECT p.problem_id, p.slug, p.title, p.difficulty, cp.problem_order, cp.points
            FROM contest_problems cp
            JOIN problems p ON cp.problem_id = p.problem_id WHERE cp.contest_id = $1 ORDER BY cp.problem_order ASC
        `, [contest.contest_id]);

        res.status(200).json({ 
            contest, 
            problems: problemsResult.rows 
        });
    } catch (error) {
        next(error);
    }
};

const createContest = async (req, res, next) => {
    try {
        const { title, description, start_time, end_time, duration_minutes, is_published = true, problems } = req.body;

        if (!title || !start_time || !end_time || !duration_minutes) {
            return res.status(400).json({ 
                error: 'Title, start_time, end_time, and duration_minutes are required.' 
            });
        }

        const userRes = await pool.query(`SELECT user_id FROM users WHERE firebase_uid = $1`, [req.user.uid]);
        const createdBy = userRes.rows[0]?.user_id || null;

        const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

        const contestResult = await pool.query(`
            INSERT INTO contests (title, slug, description, start_time, end_time, duration_minutes, is_published, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
        `, [title, slug, description || '', start_time, end_time, duration_minutes, is_published, createdBy]);

        const newContest = contestResult.rows[0];

        if (problems && Array.isArray(problems) && problems.length > 0) {
            for (const item of problems) {
                await pool.query(`
                    INSERT INTO contest_problems (contest_id, problem_id, problem_order, points) VALUES ($1, $2, $3, COALESCE($4, 100)) ON CONFLICT DO NOTHING
                `, [newContest.contest_id, item.problem_id, item.problem_order || 'A', item.points || 100]);
            }
        }

        res.status(201).json({ 
            message: 'Contest created successfully', 
            contest: newContest 
        });
    } catch (error) {
        next(error);
    }
};

const joinContest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userRes = await pool.query(`SELECT user_id FROM users WHERE firebase_uid = $1`, [req.user.uid]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ 
                error: 'User not found' 
            });
        }
        const userId = userRes.rows[0].user_id;

        const contestRes = await pool.query(`SELECT contest_id, title FROM contests WHERE contest_id::text = $1 OR slug = $1`, [id]);
        if (contestRes.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Contest not found' 
            });
        }
        const contestId = contestRes.rows[0].contest_id;

        await pool.query(`
            INSERT INTO contest_participants (contest_id, user_id) VALUES ($1, $2) ON CONFLICT (contest_id, user_id) DO NOTHING
        `, [contestId, userId]);

        res.status(200).json({ 
            message: 'Successfully registered for the contest',
            contest_id: contestId,
            user_id: userId
        });
    } catch (error) {
        next(error);
    }
};

const recalculateContestRatings = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userRes = await pool.query(`SELECT user_id, role FROM users WHERE firebase_uid = $1`, [req.user.uid]);
        if (userRes.rows.length === 0) {
            return res.status(401).json({ 
                error: 'User not found' 
            });
        }
        const currentUser = userRes.rows[0];

        const contestRes = await pool.query(`SELECT contest_id, created_by FROM contests WHERE contest_id::text = $1 OR slug = $1`, [id]);
        if (contestRes.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Contest not found' 
            });
        }
        const contest = contestRes.rows[0];

        if (contest.created_by !== currentUser.user_id && currentUser.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Access denied. Only the contest host can recalculate ratings.' 
            });
        }

        await pool.query(`SELECT update_contest_ratings($1)`, [contest.contest_id]);

        res.status(200).json({
            message: 'Contest ratings updated and leaderboard refreshed successfully',
            contest_id: contest.contest_id
        });
    } catch (error) {
        next(error);
    }
};

const addProblemsToContest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { problems } = req.body;

        if (!problems || !Array.isArray(problems) || problems.length === 0) {
            return res.status(400).json({ 
                error: 'Problems array is required' 
            });
        }

        const userRes = await pool.query(`SELECT user_id, role FROM users WHERE firebase_uid = $1`, [req.user.uid]);
        if (userRes.rows.length === 0) return res.status(401).json({ 
            error: 'User not found' 
        });
        const currentUser = userRes.rows[0];

        const contestRes = await pool.query(`SELECT contest_id, created_by FROM contests WHERE contest_id::text = $1 OR slug = $1`, [id]);
        if (contestRes.rows.length === 0) return res.status(404).json({ 
            error: 'Contest not found' 
        });
        const contest = contestRes.rows[0];

        if (contest.created_by !== currentUser.user_id && currentUser.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Access denied. Only the contest host can add problems.' 
            });
        }

        for (const item of problems) {
            await pool.query(`
                INSERT INTO contest_problems (contest_id, problem_id, problem_order, points)
                VALUES ($1, $2, $3, COALESCE($4, 100))
                ON CONFLICT (contest_id, problem_id) DO UPDATE 
                SET problem_order = EXCLUDED.problem_order, points = EXCLUDED.points
            `, [contest.contest_id, item.problem_id, item.problem_order || 'A', item.points || 100]);
        }

        res.status(200).json({ 
            message: 'Problems added to contest successfully' 
        });
    } catch (error) {
        next(error);
    }
};

const leaveContest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userRes = await pool.query(`SELECT user_id FROM users WHERE firebase_uid = $1`, [req.user.uid]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ 
                error: 'User not found' 
            });
        }
        const userId = userRes.rows[0].user_id;

        const contestRes = await pool.query(`SELECT contest_id FROM contests WHERE contest_id::text = $1 OR slug = $1`, [id]);
        if (contestRes.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Contest not found' 
            });
        }
        const contestId = contestRes.rows[0].contest_id;

        await pool.query(`
            DELETE FROM contest_participants WHERE contest_id = $1 AND user_id = $2
        `, [contestId, userId]);

        res.status(200).json({ 
            message: 'Successfully left the contest',
            contest_id: contestId,
            user_id: userId
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllContests, getContestById, createContest, joinContest, leaveContest, recalculateContestRatings, addProblemsToContest };