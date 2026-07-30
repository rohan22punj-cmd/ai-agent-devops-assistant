const statusService = require('../services/statusService');

function getStatus(req, res) {
    if (statusService.isHealthy()) {
        res.json({ service: "user-service", status: "healthy", uptime: process.uptime() });
    } else {
        res.status(500).json({ service: "user-service", status: "down" });
    }
}

module.exports = { getStatus };