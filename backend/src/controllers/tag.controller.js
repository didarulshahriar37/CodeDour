const pool = require('../config/db');

const getAllTags = async (req, res, next) => {
    try {

        const result = await pool.query(
            `SELECT tag_id, name, description FROM tags ORDER BY name ASC`
        );

        res.status(200).json({ 
            tags: result.rows 
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllTags };