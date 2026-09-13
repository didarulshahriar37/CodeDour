const express = require('express');
const router = express.Router();
const { optionalVerifyToken } = require('../middleware/authMiddleware');
const { getGlobalLeaderboard, getContestLeaderboard } = require('../controllers/leaderboard.controller');

router.get('/', getGlobalLeaderboard);
router.get('/contest/:id', optionalVerifyToken, getContestLeaderboard);
router.get('/:id', optionalVerifyToken, getContestLeaderboard);

module.exports = router;