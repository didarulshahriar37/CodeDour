const pool = require('../config/db');

const getAllAchievements = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT achievement_id, title, description, icon_url, criteria_type, criteria_value FROM achievements ORDER BY criteria_value ASC`
        );
        res.status(200).json({ 
            achievements: result.rows 
        });
    } catch (error) {
        next(error);
    }
};

const getUserAchievements = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT a.achievement_id, a.title, a.description, a.icon_url, a.criteria_type, a.criteria_value, ua.awarded_at FROM user_achievements ua JOIN achievements a ON ua.achievement_id = a.achievement_id WHERE ua.user_id = $1 ORDER BY ua.awarded_at DESC`, [id]
        );
        res.status(200).json({ 
            achievements: result.rows 
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllAchievements, getUserAchievements };