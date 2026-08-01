const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware');
const { getGlobalLeaderboard, getContestLeaderboard } = require('../controllers/leaderboard.controller');

// router.get('/', getGlobalLeaderboard);
// router.get('/:id', getContestLeaderboard);

module.exports = router;