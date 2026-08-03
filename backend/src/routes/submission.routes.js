const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware');
const { submitSolution, getSubmissionById } = require('../controllers/submission.controller');

router.post('/', verifyToken, submitSolution);
router.get('/:id', getSubmissionById);

module.exports = router;