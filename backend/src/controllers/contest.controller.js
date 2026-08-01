const pool = require('../config/db');

const getAllContests = async (req, res, next) => {
    try {
        res.status(200).json({ 
            message: 'not implemented yet' 
        });
    } catch (error) {
        next(error);
    }
};

const getContestById = async (req, res, next) => {
    try {
        res.status(200).json({ 
            message: 'not implemented yet' 
        });
    } catch (error) {
        next(error);
    }
};

const createContest = async (req, res, next) => {
    try {
        res.status(201).json({ 
            message: 'not implemented yet' 
        });
    } catch (error) {
        next(error);
    }
};

const joinContest = async (req, res, next) => {
    try {
        res.status(200).json({ 
            message: 'not implemented yet' 
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllContests, getContestById, createContest, joinContest };