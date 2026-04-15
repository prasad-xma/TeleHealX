const express = require('express');
const { analyzeSymptoms } = require('../controller/aiController');

const router = express.Router();

router.post('/analyze', analyzeSymptoms);
router.post('/analyze-symptoms', analyzeSymptoms);

module.exports = router;
