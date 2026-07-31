const statusService = require('../services/statusService');

function getStatus(req, res) {
    if (statusService.isHealthy()) {
        res.json({ service: "payment-service", status: "healthy", uptime: process.uptime() });
    } else {
        res.status(500).json({ service: "payment-service", status: "down" });
    }
}

module.exports = { getStatus };