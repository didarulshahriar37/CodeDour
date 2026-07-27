const pool = require('../config/db');

const getAllTags = async (req, res, next) => {
    try {
        res.status(200).json({ 
            message: 'not implemented yet' 
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllTags };