const pool = require('../config/db');

const submitSolution = async (req, res, next) => {
    try {
        res.status(201).json({ 
            message: 'not implemented yet' 
        });
    } catch (error) {
        next(error);
    }
};

const getSubmissionById = async (req, res, next) => {
    try {
        res.status(200).json({ 
            message: 'not implemented yet' 
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { submitSolution, getSubmissionById };