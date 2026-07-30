const express = require('express');
const router = express.Router();
const restartController = require('../controllers/restartController');

router.post('/restart', restartController.restartService);
router.post('/simulate-crash', restartController.simulateCrash);

module.exports = router;