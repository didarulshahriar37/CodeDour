const express = require('express');
const router = express.Router();
const { verifyToken, optionalVerifyToken } = require('../middleware/authMiddleware');
const { getAllProblems, getProblemById, createProblem } = require('../controllers/problem.controller');

router.get('/', optionalVerifyToken, getAllProblems);
router.get('/:id', getProblemById);
router.post('/', verifyToken, createProblem);

module.exports = router;