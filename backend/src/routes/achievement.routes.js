const express = require('express');
const router = express.Router();
const { getUserAchievements, getAllAchievements } = require('../controllers/achievement.controller');

router.get('/', getAllAchievements);
router.get('/user/:id', getUserAchievements);

module.exports = router;