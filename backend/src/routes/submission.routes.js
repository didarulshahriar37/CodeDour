const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { submitSolution, getSubmissionById, getAllSubmissions } = require('../controllers/submission.controller');

router.post('/', verifyToken, submitSolution);
router.get('/', verifyToken, getAllSubmissions);
router.get('/:id', getSubmissionById);

module.exports = router;