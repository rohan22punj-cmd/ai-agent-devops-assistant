const statusService = require('../services/statusService');

function restartService(req, res) {
    statusService.setHealthy(true);
    res.json({ message: "user-service restarted successfully", status: "healthy" });
}

function simulateCrash(req, res) {
    statusService.setHealthy(false);
    res.json({ message: "user-service is now simulated as DOWN" });
}

module.exports = { restartService, simulateCrash };