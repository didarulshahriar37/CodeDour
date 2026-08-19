const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware');
const { getAllContests, getContestById, createContest, joinContest, recalculateContestRatings, addProblemsToContest } = require('../controllers/contest.controller');

router.get('/', getAllContests);
router.get('/:id', getContestById);
router.post('/', verifyToken, createContest);
router.post('/:id/join', verifyToken, joinContest);
router.post('/:id/problems', verifyToken, addProblemsToContest);
router.post('/:id/recalculate-ratings', verifyToken, recalculateContestRatings);

module.exports = router;