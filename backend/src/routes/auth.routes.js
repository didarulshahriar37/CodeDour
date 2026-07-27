const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware');
const {syncUser} = require('../controllers/auth.controller');

// router.post('/sync', verifyToken, syncUser);

module.exports = router;