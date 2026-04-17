const express = require('express');
const { analyzeSymptoms, getLatestResult } = require('../controller/aiController');

const router = express.Router();

router.post('/analyze', analyzeSymptoms);
router.post('/analyze-symptoms', analyzeSymptoms);
router.get('/latest', getLatestResult);

module.exports = router;
