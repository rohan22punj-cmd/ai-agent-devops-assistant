const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');

router.get('/logs', logsController.getLogs);

module.exports = router;