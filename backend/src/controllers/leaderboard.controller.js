const pool = require('../config/db');

const getGlobalLeaderboard = async (req, res, next) => {
    try {
        res.status(200).json({ 
            message: 'not implemented yet' 
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