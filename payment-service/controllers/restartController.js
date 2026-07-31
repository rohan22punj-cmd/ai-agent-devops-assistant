const statusService = require('../services/statusService');

function restartService(req, res) {
    statusService.setHealthy(true);
    res.json({ message: "payment-service restarted successfully", status: "healthy" });
}

function simulateCrash(req, res) {
    statusService.setHealthy(false);
    res.json({ message: "payment-service is now simulated as DOWN" });
}

module.exports = { restartService, simulateCrash };