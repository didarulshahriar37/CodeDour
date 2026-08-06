const express = require('express');
const router = express.Router();
const { verifyToken, optionalVerifyToken } = require('../middleware/authMiddleware');
const { getAllProblems, getProblemById, createProblem, getRecommendedByTags } = require('../controllers/problem.controller');

router.get('/', optionalVerifyToken, getAllProblems);
router.get('/:id/recommendations', getRecommendedByTags);
router.get('/:id', getProblemById);
router.post('/', verifyToken, createProblem);

module.exports = router;