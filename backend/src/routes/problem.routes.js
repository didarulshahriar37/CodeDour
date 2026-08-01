const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware');
const { getAllProblems, getProblemById, createProblem } = require('../controllers/problem.controller');

router.get('/', getAllProblems);
router.get('/:id', getProblemById);
router.get('/', verifyToken, createProblem);

module.exports = router;