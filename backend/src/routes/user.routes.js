const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware');
const { getMyProfile, getUserById, getUserSubmissions, getUserStats, updateProfile } = require('../controllers/user.controller');

router.get('/profile', verifyToken, getMyProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/:id', getUserById);
router.get('/:id/stats', getUserStats);
router.get('/:id/submissions', getUserSubmissions);

module.exports = router;