const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware');
const { getUserAchievements, getAllAchievements } = require('../controllers/achievement.controller');

router.get('/', getAllAchievements);
router.get('/:id', getUserAchievements);

module.exports = router;