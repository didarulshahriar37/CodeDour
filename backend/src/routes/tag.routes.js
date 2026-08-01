const express = require('express');
const router = express.Router();
const { getAllTags } = require('../controllers/tag.controller');

router.get('/', getAllTags);

module.exports = router;