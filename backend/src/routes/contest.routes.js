const express = require('express');
const router = express.Router();
const { verifyToken, optionalVerifyToken } = require('../middleware/authMiddleware');
const { getAllContests, getContestById, createContest, joinContest, leaveContest, recalculateContestRatings, addProblemsToContest } = require('../controllers/contest.controller');

router.get('/', optionalVerifyToken, getAllContests);
router.get('/:id', optionalVerifyToken, getContestById);
router.post('/', verifyToken, createContest);
router.post('/:id/join', verifyToken, joinContest);
router.delete('/:id/join', verifyToken, leaveContest);
router.post('/:id/problems', verifyToken, addProblemsToContest);
router.post('/:id/recalculate-ratings', verifyToken, recalculateContestRatings);

module.exports = router;