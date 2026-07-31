const express = require('express');
const router = express.Router();
const restartController = require('../controllers/restartController');
const { checkApiKey } = require('../middleware/authMiddleware');

router.post('/restart', checkApiKey, restartController.restartService);
router.post('/simulate-crash', restartController.simulateCrash);

module.exports = router;