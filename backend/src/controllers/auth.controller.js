const pool = require('../config/db');

const syncUser = async(req, res, next) => {
    try{
        const {uid, email, name, picture} = req.user;
        const fullName = req.body?.fullName;

        const displayName = fullName || name || email.split('@')[0];
        const username = email.split('@')[0];
        const avatar = picture || null;

        const existing = await pool.query(
            `SELECT * FROM users WHERE firebase_uid = $1`, [uid]
        );

        if(existing.rows.length > 0){
            const updated = await pool.query(
                `UPDATE users SET 
                display_name = COALESCE($1, display_name),
                avatar_url = COALESCE($2, avatar_url),
                updated_at = CURRENT_TIMESTAMP
                WHERE firebase_uid = $3 RETURNING *`,
                [displayName, avatar, uid]
            );

            return res.status(200).json({
                message: 'User synced successfully',
                user: updated.rows[0]
            });
        }

        const result = await pool.query(
            `INSERT INTO users (firebase_uid, username, email, display_name, avatar_url, rating, max_rating) VALUES ($1, $2, $3, $4, $5, 0, 0) RETURNING *`,[uid, username, email, displayName, avatar]
        );

        res.status(200).json({
            message: 'User created successfully',
            user: result.rows[0]
        });
    } 
    catch(err){
        next(err);
    }
};

module.exports = {syncUser};